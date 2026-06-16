import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import { signout } from "@/app/auth/actions";

// 화면 맨 위에 항상 보이는 상단 바 (로고 + 로그인 상태별 버튼)
export function Header({ user }: { user: User | null }) {
  return (
    <header className="top-bar">
      <Link href="/" className="top-bar-brand">
        <span style={{ fontSize: 22 }}>🍠</span>
        <span className="brand-gradient" style={{ fontSize: 20, fontWeight: 800 }}>
          고구마마켓
        </span>
      </Link>

      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        {user ? (
          <>
            <Link href="/chat" className="nav-btn nav-btn-ghost">
              💬 채팅
            </Link>
            <Link href="/products/new" className="nav-btn nav-btn-primary">
              ＋ 등록
            </Link>
            <form action={signout}>
              <button type="submit" className="nav-btn nav-btn-ghost">
                로그아웃
              </button>
            </form>
          </>
        ) : (
          <>
            <Link href="/login" className="nav-btn nav-btn-ghost">
              로그인
            </Link>
            <Link href="/signup" className="nav-btn nav-btn-primary">
              회원가입
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
