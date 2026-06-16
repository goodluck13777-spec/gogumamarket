import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/app/_components/Header";
import { ProductCard, type ProductCardData } from "@/app/products/_components/ProductCard";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ created?: string; deleted?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { created, deleted } = await searchParams;

  // 로그인한 경우에만 상품 목록을 가져옴
  const products = user
    ? (
        await supabase
          .from("products")
          .select("id, title, price, category, image_url, status, created_at")
          .order("created_at", { ascending: false })
          .limit(60)
      ).data
    : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Header user={user} />

      <main style={{ flex: 1, width: "100%", maxWidth: 1000, margin: "0 auto", padding: "20px 16px 48px" }}>
        {user ? (
          // ===== 로그인 상태 =====
          <>
            <div style={{ marginBottom: 20, padding: "14px 20px", borderRadius: 18, background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.85)", display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 22 }}>🍠</span>
              <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "var(--text)" }}>
                <span className="brand-gradient">
                  {user.user_metadata?.nickname ?? user.email?.split("@")[0]}님
                </span>{" "}
                접속하셨네요, 반가워요!
              </p>
            </div>

            {created ? (
              <div className="alert alert-info" style={{ marginBottom: 16 }}>
                상품이 등록되었어요! 🎉
              </div>
            ) : null}
            {deleted ? (
              <div className="alert alert-error" style={{ marginBottom: 16 }}>
                상품이 삭제되었어요.
              </div>
            ) : null}

            {products && products.length > 0 ? (
              <div className="product-grid">
                {(products as ProductCardData[]).map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div style={{ fontSize: 48, marginBottom: 12 }}>🍠</div>
                <p style={{ fontWeight: 700, marginBottom: 6, color: "var(--text)" }}>
                  아직 등록된 상품이 없어요
                </p>
                <p style={{ fontSize: 13, marginBottom: 20 }}>첫 번째 물건을 올려보세요!</p>
                <Link
                  href="/products/new"
                  className="btn-primary"
                  style={{ display: "inline-block", width: "auto", padding: "13px 28px" }}
                >
                  ＋ 상품 등록하기
                </Link>
              </div>
            )}
          </>
        ) : (
          // ===== 비로그인 상태: 환영 화면 =====
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", textAlign: "center", padding: "40px 16px" }}>
            <div style={{ fontSize: 72, marginBottom: 24, animation: "floaty 3s ease-in-out infinite" }}>🍠</div>
            <h1 style={{ fontSize: 28, fontWeight: 800, margin: "0 0 12px", lineHeight: 1.3 }}>
              <span className="brand-gradient">고구마마켓</span>에
              <br />
              오신 걸 환영해요!
            </h1>
            <p style={{ fontSize: 15, color: "var(--text-dim)", margin: "0 0 32px", lineHeight: 1.7 }}>
              우리 동네 이웃과 중고 물건을 사고 파는 곳이에요.
              <br />
              로그인하면 등록된 상품들을 확인할 수 있어요.
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
              <Link
                href="/login"
                className="btn-primary"
                style={{ display: "inline-block", width: "auto", padding: "14px 36px", textDecoration: "none" }}
              >
                로그인하기
              </Link>
              <Link
                href="/signup"
                className="btn-ghost"
                style={{ display: "inline-flex", padding: "14px 36px", textDecoration: "none" }}
              >
                회원가입
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
