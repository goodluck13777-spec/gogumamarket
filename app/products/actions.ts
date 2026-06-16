"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const BUCKET = "product-images";

function errorRedirect(message: string) {
  redirect(`/products/new?error=${encodeURIComponent(message)}`);
}

// 이미지 URL에서 Storage 경로만 추출 (삭제할 때 사용)
function getStoragePath(imageUrl: string): string | null {
  const marker = `/object/public/${BUCKET}/`;
  const idx = imageUrl.indexOf(marker);
  if (idx === -1) return null;
  return decodeURIComponent(imageUrl.slice(idx + marker.length));
}

export async function createProduct(formData: FormData) {
  const supabase = await createClient();

  // 로그인 확인
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const title = String(formData.get("title") ?? "").trim();
  const priceRaw = String(formData.get("price") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const image = formData.get("image");

  // 유효성 검사
  if (!title) errorRedirect("상품 제목을 입력해 주세요.");
  if (title.length > 100) errorRedirect("제목은 100자 이내로 입력해 주세요.");

  const price = Number(priceRaw);
  if (!priceRaw || Number.isNaN(price) || price < 0) {
    errorRedirect("올바른 가격을 입력해 주세요.");
  }

  // 이미지 업로드 (선택)
  let imageUrl: string | null = null;
  if (image instanceof File && image.size > 0) {
    if (image.size > 5 * 1024 * 1024) {
      errorRedirect("이미지는 5MB 이하만 업로드할 수 있어요.");
    }
    const ext = (image.type.split("/")[1] ?? "jpg").replace("jpeg", "jpg");
    const path = `${user.id}/${crypto.randomUUID()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, image, { contentType: image.type, upsert: false });

    if (uploadError) {
      errorRedirect("이미지 업로드에 실패했어요: " + uploadError.message);
    }

    imageUrl = supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
  }

  // 상품 등록
  const { error: insertError } = await supabase.from("products").insert({
    seller_id: user.id,
    title,
    price,
    description: description || null,
    category: category || null,
    image_url: imageUrl,
  });

  if (insertError) {
    errorRedirect("상품 등록에 실패했어요: " + insertError.message);
  }

  revalidatePath("/");
  redirect("/?created=1");
}

const PRODUCT_STATUSES = ["selling", "reserved", "sold"] as const;
type ProductStatus = (typeof PRODUCT_STATUSES)[number];

// 판매자가 본인 상품의 판매 상태를 변경 (판매중/예약중/거래완료)
export async function updateProductStatus(productId: string, status: ProductStatus) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  if (!PRODUCT_STATUSES.includes(status)) {
    redirect(`/products/${productId}`);
  }

  await supabase.from("products").update({ status }).eq("id", productId);

  revalidatePath(`/products/${productId}`);
  revalidatePath("/");
  redirect(`/products/${productId}`);
}

// 상품 수정 (이미지 교체/삭제 포함)
export async function updateProduct(productId: string, formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // 내 상품인지 확인
  const { data: product } = await supabase
    .from("products")
    .select("id, seller_id, image_url")
    .eq("id", productId)
    .maybeSingle();

  if (!product || product.seller_id !== user.id) redirect("/");

  const title = String(formData.get("title") ?? "").trim();
  const priceRaw = String(formData.get("price") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const image = formData.get("image");
  const deleteImage = formData.get("delete_image") === "1";

  function editError(msg: string) {
    redirect(`/products/${productId}/edit?error=${encodeURIComponent(msg)}`);
  }

  if (!title) editError("상품 제목을 입력해 주세요.");
  if (title.length > 100) editError("제목은 100자 이내로 입력해 주세요.");

  const price = Number(priceRaw);
  if (!priceRaw || Number.isNaN(price) || price < 0) {
    editError("올바른 가격을 입력해 주세요.");
  }

  // undefined = 이미지 변경 없음 / null = 이미지 삭제 / string = 새 URL
  let imageUrl: string | null | undefined = undefined;

  if (deleteImage) {
    // 기존 이미지를 Storage에서 삭제
    if (product.image_url) {
      const path = getStoragePath(product.image_url);
      if (path) await supabase.storage.from(BUCKET).remove([path]);
    }
    imageUrl = null;
  } else if (image instanceof File && image.size > 0) {
    if (image.size > 5 * 1024 * 1024) editError("이미지는 5MB 이하만 업로드할 수 있어요.");

    // 기존 이미지를 Storage에서 먼저 삭제
    if (product.image_url) {
      const oldPath = getStoragePath(product.image_url);
      if (oldPath) await supabase.storage.from(BUCKET).remove([oldPath]);
    }

    const ext = (image.type.split("/")[1] ?? "jpg").replace("jpeg", "jpg");
    const path = `${user.id}/${crypto.randomUUID()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, image, { contentType: image.type, upsert: false });

    if (uploadError) editError("이미지 업로드에 실패했어요: " + uploadError.message);

    imageUrl = supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
  }

  const updateData: Record<string, unknown> = {
    title,
    price,
    description: description || null,
    category: category || null,
  };
  if (imageUrl !== undefined) updateData.image_url = imageUrl;

  const { error: updateError } = await supabase
    .from("products")
    .update(updateData)
    .eq("id", productId)
    .eq("seller_id", user.id);

  if (updateError) editError("상품 수정에 실패했어요: " + updateError.message);

  revalidatePath(`/products/${productId}`);
  revalidatePath("/");
  redirect(`/products/${productId}?updated=1`);
}

// 상품 삭제 (Storage 이미지도 함께 삭제)
export async function deleteProduct(productId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: product } = await supabase
    .from("products")
    .select("id, seller_id, image_url")
    .eq("id", productId)
    .maybeSingle();

  if (!product || product.seller_id !== user.id) redirect("/");

  const { error: deleteError } = await supabase
    .from("products")
    .delete()
    .eq("id", productId)
    .eq("seller_id", user.id);

  if (deleteError) {
    redirect(
      `/products/${productId}?error=${encodeURIComponent("삭제에 실패했어요: " + deleteError.message)}`
    );
  }

  // DB 삭제 성공 후 Storage 이미지도 정리
  if (product.image_url) {
    const path = getStoragePath(product.image_url);
    if (path) await supabase.storage.from(BUCKET).remove([path]);
  }

  revalidatePath("/");
  redirect("/?deleted=1");
}
