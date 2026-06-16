import Link from "next/link";
import { redirect } from "next/navigation";
import { login } from "@/app/auth/actions";
import { createClient } from "@/lib/supabase/server";
import { BrandHeader } from "@/app/_components/BrandHeader";
import { SubmitButton } from "@/app/_components/SubmitButton";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  // 이미 로그인했다면 홈으로
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/");

  const { error, message } = await searchParams;

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
        <BrandHeader subtitle="다시 만나서 반가워요 👋" />

        {message ? (
          <div className="alert alert-info" style={{ marginBottom: 16 }}>
            {message}
          </div>
        ) : null}
        {error ? (
          <div className="alert alert-error" style={{ marginBottom: 16 }}>
            {error}
          </div>
        ) : null}

        <form action={login} style={{ display: "grid", gap: 12 }}>
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
            placeholder="비밀번호"
            autoComplete="current-password"
            required
          />
          <SubmitButton pendingText="로그인 중...">로그인</SubmitButton>
        </form>

        <p
          style={{
            textAlign: "center",
            marginTop: 20,
            fontSize: 14,
            color: "var(--text-dim)",
          }}
        >
          아직 회원이 아니신가요?{" "}
          <Link href="/signup" className="link-accent">
            회원가입
          </Link>
        </p>
      </div>
    </main>
  );
}
