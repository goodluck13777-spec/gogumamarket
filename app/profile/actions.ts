"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const BUCKET = "avatars";

function getStoragePath(avatarUrl: string): string | null {
  const marker = `/object/public/${BUCKET}/`;
  const idx = avatarUrl.indexOf(marker);
  if (idx === -1) return null;
  return decodeURIComponent(avatarUrl.slice(idx + marker.length));
}

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const nickname = String(formData.get("nickname") ?? "").trim();
  const bio = String(formData.get("bio") ?? "").trim();
  const avatar = formData.get("avatar");
  const deleteAvatar = formData.get("delete_avatar") === "1";

  function profileError(msg: string) {
    redirect(`/profile?error=${encodeURIComponent(msg)}`);
  }

  if (nickname.length > 20) profileError("닉네임은 20자 이내로 입력해 주세요.");
  if (bio.length > 200) profileError("자기소개는 200자 이내로 입력해 주세요.");

  // 기존 프로필 조회 (아바타 URL 삭제용)
  const { data: existing } = await supabase
    .from("profiles")
    .select("avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  let avatarUrl: string | null | undefined = undefined;

  if (deleteAvatar) {
    if (existing?.avatar_url) {
      const path = getStoragePath(existing.avatar_url);
      if (path) await supabase.storage.from(BUCKET).remove([path]);
    }
    avatarUrl = null;
  } else if (avatar instanceof File && avatar.size > 0) {
    if (avatar.size > 3 * 1024 * 1024) profileError("프로필 사진은 3MB 이하만 업로드할 수 있어요.");

    // 기존 아바타 삭제 후 새 이미지 업로드
    if (existing?.avatar_url) {
      const oldPath = getStoragePath(existing.avatar_url);
      if (oldPath) await supabase.storage.from(BUCKET).remove([oldPath]);
    }

    const ext = (avatar.type.split("/")[1] ?? "jpg").replace("jpeg", "jpg");
    const path = `${user.id}/${crypto.randomUUID()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, avatar, { contentType: avatar.type, upsert: false });

    if (uploadError) profileError("사진 업로드에 실패했어요: " + uploadError.message);

    avatarUrl = supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
  }

  const upsertData: Record<string, unknown> = {
    id: user.id,
    nickname: nickname || user.email?.split("@")[0] || null,
    bio: bio || null,
    updated_at: new Date().toISOString(),
  };
  if (avatarUrl !== undefined) upsertData.avatar_url = avatarUrl;

  const { error } = await supabase.from("profiles").upsert(upsertData);
  if (error) profileError("저장에 실패했어요: " + error.message);

  revalidatePath("/profile");
  revalidatePath("/");
  redirect("/profile?saved=1");
}
