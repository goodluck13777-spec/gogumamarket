"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// 폼 에러를 로그인/회원가입 페이지로 다시 전달하기 위한 헬퍼
function errorRedirect(path: string, message: string) {
  redirect(`${path}?error=${encodeURIComponent(message)}`);
}

// 한글 에러 메시지 매핑
function friendlyMessage(raw: string) {
  if (/invalid login credentials/i.test(raw))
    return "이메일 또는 비밀번호가 올바르지 않습니다.";
  if (/already registered|already exists/i.test(raw))
    return "이미 가입된 이메일입니다.";
  if (/password should be at least/i.test(raw))
    return "비밀번호는 6자 이상이어야 합니다.";
  if (/unable to validate email|invalid email/i.test(raw))
    return "유효한 이메일 주소를 입력해 주세요.";
  return raw;
}

export async function login(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    errorRedirect("/login", "이메일과 비밀번호를 입력해 주세요.");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    errorRedirect("/login", friendlyMessage(error.message));
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function signup(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const nickname = String(formData.get("nickname") ?? "").trim();

  if (!email || !password) {
    errorRedirect("/signup", "이메일과 비밀번호를 입력해 주세요.");
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // 닉네임은 사용자 메타데이터에 저장 (권한 판단용으로는 절대 사용 금지)
      data: { nickname: nickname || email.split("@")[0] },
    },
  });

  if (error) {
    errorRedirect("/signup", friendlyMessage(error.message));
  }

  // 이메일 인증이 켜져 있으면 세션이 없습니다 → 메일 확인 안내
  if (!data.session) {
    redirect("/login?message=" + encodeURIComponent("가입 확인 메일을 보냈어요. 메일함을 확인해 주세요!"));
  }

  // 이메일 인증이 꺼져 있으면 바로 로그인 상태 → 홈으로
  revalidatePath("/", "layout");
  redirect("/");
}

export async function signout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
