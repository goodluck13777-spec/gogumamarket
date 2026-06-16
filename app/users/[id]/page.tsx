import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/app/_components/Header";
import { ProductCard, type ProductCardData } from "@/app/products/_components/ProductCard";
import Link from "next/link";

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user: me },
  } = await supabase.auth.getUser();

  // 프로필 조회 (행이 없으면 기본값 사용)
  const { data: profile } = await supabase
    .from("profiles")
    .select("nickname, bio, avatar_url")
    .eq("id", id)
    .maybeSingle();

  // 상품이 하나도 없고 프로필도 없으면 존재하지 않는 사용자
  const { count } = await supabase
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("seller_id", id);

  if (!profile && count === 0) notFound();

  // 이 사람의 상품 목록 조회
  const { data: products } = await supabase
    .from("products")
    .select("id, title, price, category, image_url, status, created_at")
    .eq("seller_id", id)
    .order("created_at", { ascending: false });

  const isMe = me?.id === id;

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Header user={me} />

      <main style={{ flex: 1, width: "100%", maxWidth: 680, margin: "0 auto", padding: "24px 16px 48px" }}>
        <Link href="/" className="nav-btn nav-btn-ghost" style={{ display: "inline-block", marginBottom: 20 }}>
          ← 홈으로
        </Link>

        {/* 프로필 카드 */}
        <div
          className="glass-card"
          style={{ padding: 28, marginBottom: 24, display: "flex", alignItems: "center", gap: 20 }}
        >
          {/* 아바타 */}
          {profile.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.avatar_url}
              alt="프로필 사진"
              style={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                objectFit: "cover",
                flexShrink: 0,
                border: "3px solid rgba(255,138,61,0.35)",
              }}
            />
          ) : (
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                background: "linear-gradient(135deg, rgba(255,138,61,0.25), rgba(168,85,247,0.25))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 36,
                flexShrink: 0,
                border: "3px solid rgba(255,138,61,0.25)",
              }}
            >
              🍠
            </div>
          )}

          {/* 텍스트 */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 6 }}>
              <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>
                {profile.nickname ?? "판매자"}
              </h1>
              {isMe && (
                <Link
                  href="/profile"
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#ef5b1f",
                    background: "rgba(255,138,61,0.1)",
                    border: "1px solid rgba(255,138,61,0.3)",
                    padding: "3px 10px",
                    borderRadius: 8,
                    textDecoration: "none",
                  }}
                >
                  ✏️ 수정
                </Link>
              )}
            </div>
            {profile.bio ? (
              <p style={{ margin: 0, fontSize: 14, color: "var(--text-dim)", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                {profile.bio}
              </p>
            ) : (
              <p style={{ margin: 0, fontSize: 13, color: "var(--text-dim)", fontStyle: "italic" }}>
                아직 자기소개가 없어요.
              </p>
            )}
          </div>
        </div>

        {/* 상품 목록 */}
        <div style={{ marginBottom: 14 }}>
          <h2 style={{ fontSize: 15, fontWeight: 800, margin: "0 0 14px", color: "var(--text)" }}>
            {isMe ? "내가 올린 상품" : `${profile.nickname ?? "판매자"}님의 상품`}
            {products && products.length > 0 ? (
              <span style={{ marginLeft: 6, fontSize: 13, fontWeight: 600, color: "var(--text-dim)" }}>
                ({products.length})
              </span>
            ) : null}
          </h2>

          {products && products.length > 0 ? (
            <div className="product-grid">
              {(products as ProductCardData[]).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="empty-state" style={{ padding: "40px 20px" }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>🍠</div>
              <p style={{ fontWeight: 700, marginBottom: 4 }}>아직 등록한 상품이 없어요</p>
              {isMe && (
                <Link
                  href="/products/new"
                  className="btn-primary"
                  style={{ display: "inline-block", width: "auto", padding: "12px 28px", marginTop: 14, textDecoration: "none" }}
                >
                  ＋ 첫 상품 등록하기
                </Link>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
