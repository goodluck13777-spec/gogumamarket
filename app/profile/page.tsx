import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/app/_components/Header";
import { updateProfile } from "@/app/profile/actions";

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { saved, error } = await searchParams;

  const { data: profile } = await supabase
    .from("profiles")
    .select("nickname, bio, avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  const nickname = profile?.nickname ?? user.user_metadata?.nickname ?? user.email?.split("@")[0] ?? "";
  const bio = profile?.bio ?? "";
  const avatarUrl = profile?.avatar_url ?? null;

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Header user={user} />

      <main style={{ flex: 1, width: "100%", maxWidth: 480, margin: "0 auto", padding: "24px 16px 48px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <h1 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>내 프로필</h1>
          <Link
            href={`/users/${user.id}`}
            className="nav-btn nav-btn-ghost"
            style={{ fontSize: 13 }}
          >
            내 글 모아보기 →
          </Link>
        </div>

        {saved ? (
          <div className="alert alert-info" style={{ marginBottom: 16 }}>
            프로필이 저장되었어요! ✅
          </div>
        ) : null}
        {error ? (
          <div className="alert alert-error" style={{ marginBottom: 16 }}>
            {decodeURIComponent(error)}
          </div>
        ) : null}

        <div className="glass-card" style={{ padding: 28 }}>
          <form action={updateProfile} style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* 프로필 사진 */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
              <div style={{ position: "relative" }}>
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatarUrl}
                    alt="프로필 사진"
                    style={{
                      width: 100,
                      height: 100,
                      borderRadius: "50%",
                      objectFit: "cover",
                      border: "3px solid rgba(255,138,61,0.4)",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: 100,
                      height: 100,
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, rgba(255,138,61,0.25), rgba(168,85,247,0.25))",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 40,
                      border: "3px solid rgba(255,138,61,0.3)",
                    }}
                  >
                    🍠
                  </div>
                )}
              </div>

              <label
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 18px",
                  borderRadius: 12,
                  border: "1.5px solid rgba(255,138,61,0.4)",
                  background: "rgba(255,138,61,0.08)",
                  color: "#ef5b1f",
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                📷 사진 변경
                <input
                  type="file"
                  name="avatar"
                  accept="image/*"
                  style={{ display: "none" }}
                />
              </label>

              {avatarUrl ? (
                <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--text-dim)", cursor: "pointer" }}>
                  <input type="checkbox" name="delete_avatar" value="1" style={{ accentColor: "#ff4d6d" }} />
                  현재 사진 삭제
                </label>
              ) : null}
            </div>

            <div style={{ height: 1, background: "rgba(45,36,64,0.08)" }} />

            {/* 닉네임 */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 700, color: "var(--text-dim)" }}>닉네임</label>
              <input
                className="field"
                type="text"
                name="nickname"
                defaultValue={nickname}
                placeholder="닉네임을 입력해 주세요"
                maxLength={20}
              />
              <span style={{ fontSize: 11, color: "var(--text-dim)", textAlign: "right" }}>최대 20자</span>
            </div>

            {/* 자기소개 */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 700, color: "var(--text-dim)" }}>자기소개</label>
              <textarea
                className="field"
                name="bio"
                defaultValue={bio}
                placeholder="간단한 자기소개를 입력해 주세요 (예: 안경 수집가 🕶️)"
                maxLength={200}
                rows={4}
                style={{ resize: "vertical", minHeight: 100 }}
              />
              <span style={{ fontSize: 11, color: "var(--text-dim)", textAlign: "right" }}>최대 200자</span>
            </div>

            <button type="submit" className="btn-primary">
              저장하기
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
