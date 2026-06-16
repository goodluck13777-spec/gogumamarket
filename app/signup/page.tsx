import Link from "next/link";
import { redirect } from "next/navigation";
import { signup } from "@/app/auth/actions";
import { createClient } from "@/lib/supabase/server";
import { BrandHeader } from "@/app/_components/BrandHeader";
import { SubmitButton } from "@/app/_components/SubmitButton";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  // 이미 로그인했다면 홈으로
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/");

  const { error } = await searchParams;

  return (
    <main
      style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <div className="glass-card" style={{ width: "100%", maxWidth: 400, padding: 32 }}>
        <BrandHeader subtitle="우리 동네 중고거래, 지금 시작해요 🥳" />

        {error ? (
          <div className="alert alert-error" style={{ marginBottom: 16 }}>
            {error}
          </div>
        ) : null}

        <form action={signup} style={{ display: "grid", gap: 12 }}>
          <input
            className="field"
            type="text"
            name="nickname"
            placeholder="닉네임 (예: 고구마러버)"
            autoComplete="nickname"
          />
          <input
            className="field"
            type="email"
            name="email"
            placeholder="이메일"
            autoComplete="email"
            required
          />
          <input
            className="field"
            type="password"
            name="password"
            placeholder="비밀번호 (6자 이상)"
            autoComplete="new-password"
            minLength={6}
            required
          />
          <SubmitButton pendingText="가입 중...">회원가입</SubmitButton>
        </form>

        <p
          style={{
            textAlign: "center",
            marginTop: 20,
            fontSize: 14,
            color: "var(--text-dim)",
          }}
        >
          이미 회원이신가요?{" "}
          <Link href="/login" className="link-accent">
            로그인
          </Link>
        </p>
      </div>
    </main>
  );
}
