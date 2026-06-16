"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// 상품 문의 시작: 이미 대화방이 있으면 그 방으로, 없으면 새로 만들어서 이동
export async function startChat(productId: string, sellerId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  if (user.id === sellerId) redirect(`/products/${productId}`);

  const { data: existing } = await supabase
    .from("chat_rooms")
    .select("id")
    .eq("product_id", productId)
    .eq("buyer_id", user.id)
    .maybeSingle();

  if (existing) redirect(`/chat/${existing.id}`);

  const { data: created, error } = await supabase
    .from("chat_rooms")
    .insert({ product_id: productId, buyer_id: user.id, seller_id: sellerId })
    .select("id")
    .single();

  if (error || !created) redirect(`/products/${productId}`);

  redirect(`/chat/${created.id}`);
}

// 거래 후기 작성: 거래완료된 상품의 구매자가 판매자에게 별점/후기 남기기
export async function createReview(
  roomId: string,
  productId: string,
  sellerId: string,
  formData: FormData
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const rating = Number(formData.get("rating"));
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) redirect(`/chat/${roomId}`);

  const content = String(formData.get("content") ?? "").trim();

  await supabase.from("reviews").insert({
    product_id: productId,
    reviewer_id: user.id,
    reviewee_id: sellerId,
    rating,
    content: content || null,
  });

  revalidatePath(`/chat/${roomId}`);
  redirect(`/chat/${roomId}`);
}

// 채팅방에 메시지 전송
export async function sendMessage(roomId: string, formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const content = String(formData.get("content") ?? "").trim();
  if (!content) redirect(`/chat/${roomId}`);

  await supabase.from("messages").insert({
    room_id: roomId,
    sender_id: user.id,
    content,
  });

  redirect(`/chat/${roomId}`);
}
