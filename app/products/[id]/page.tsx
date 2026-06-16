import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/app/_components/Header";
import { formatPrice, timeAgo } from "@/lib/format";
import { updateProductStatus } from "@/app/products/actions";
import { startChat } from "@/app/chat/actions";
import { DeleteProductButton } from "@/app/products/_components/DeleteProductButton";
import { LikeButton } from "@/app/products/_components/LikeButton";
import { CommentsSection } from "@/app/products/_components/CommentsSection";

const STATUS_LABEL: Record<string, string> = {
  reserved: "예약중",
  sold: "거래완료",
};

const STATUS_OPTIONS = [
  { value: "selling", label: "판매중" },
  { value: "reserved", label: "예약중" },
  { value: "sold", label: "거래완료" },
] as const;

export default async function ProductDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ updated?: string; error?: string }>;
}) {
  const { id } = await params;
  const { updated, error } = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: product } = await supabase
    .from("products")
    .select("id, title, price, description, category, image_url, status, created_at, seller_id")
    .eq("id", id)
    .maybeSingle();

  if (!product) {
    notFound();
  }

  // 댓글 목록 조회
  const { data: comments } = await supabase
    .from("comments")
    .select("id, user_id, user_email, content, created_at")
    .eq("product_id", id)
    .order("created_at", { ascending: true });

  // 좋아요 수 + 내가 좋아요 눌렀는지 조회
  const { data: likes } = await supabase
    .from("likes")
    .select("user_id")
    .eq("product_id", id);

  const likeCount = likes?.length ?? 0;
  const isLiked = !!(user && likes?.some((l) => l.user_id === user.id));

  const badge = STATUS_LABEL[product.status];
  const isOwner = user?.id === product.seller_id;

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Header user={user} />

      <main style={{ flex: 1, width: "100%", maxWidth: 640, margin: "0 auto", padding: "20px 16px 48px" }}>
        <Link href="/" className="nav-btn nav-btn-ghost" style={{ display: "inline-block", marginBottom: 16 }}>
          ← 목록으로
        </Link>

        {updated ? (
          <div className="alert alert-info" style={{ marginBottom: 16 }}>
            상품이 수정되었어요! ✏️
          </div>
        ) : null}
        {error ? (
          <div className="alert alert-error" style={{ marginBottom: 16 }}>
            {decodeURIComponent(error)}
          </div>
        ) : null}

        <div className="detail-image-wrap">
          {product.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.image_url} alt={product.title} className="detail-image" />
          ) : (
            <div className="detail-image-placeholder">🍠</div>
          )}
          {badge ? <span className="detail-status-badge">{badge}</span> : null}
        </div>

        <div className="glass-card" style={{ padding: 20 }}>
          {isOwner ? (
            <>
              {/* 상태 변경 버튼 */}
              <div className="status-control">
                {STATUS_OPTIONS.map((option) => (
                  <form key={option.value} action={updateProductStatus.bind(null, product.id, option.value)}>
                    <button
                      type="submit"
                      className={`status-btn ${product.status === option.value ? "status-btn-active" : ""}`}
                    >
                      {option.label}
                    </button>
                  </form>
                ))}
              </div>

              {/* 수정 / 삭제 버튼 */}
              <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                <Link
                  href={`/products/${product.id}/edit`}
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "10px",
                    borderRadius: "12px",
                    border: "1.5px solid rgba(255,138,61,0.4)",
                    background: "rgba(255,138,61,0.08)",
                    color: "#ef5b1f",
                    fontWeight: 700,
                    fontSize: 13,
                    textDecoration: "none",
                  }}
                >
                  ✏️ 수정하기
                </Link>
                <DeleteProductButton productId={product.id} />
              </div>
            </>
          ) : null}

          <div className="product-card-meta" style={{ marginBottom: 8 }}>
            {product.category ? <span className="product-card-tag">{product.category}</span> : null}
            <span>{timeAgo(product.created_at)}</span>
          </div>
          <h1 className="detail-title">{product.title}</h1>
          <p className="detail-price">{formatPrice(product.price)}</p>
          {product.description ? (
            <p className="detail-description">{product.description}</p>
          ) : null}

          {/* 좋아요 버튼 */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 16, paddingTop: 14, borderTop: "1px solid var(--panel-border)" }}>
            <LikeButton
              productId={product.id}
              likeCount={likeCount}
              isLiked={isLiked}
              isLoggedIn={!!user}
            />
            <span style={{ fontSize: 13, color: "var(--text-dim)" }}>
              {likeCount > 0 ? `${likeCount}명이 관심 있어요` : "관심 있으면 좋아요를 눌러보세요"}
            </span>
          </div>

          {!isOwner ? (
            <form action={startChat.bind(null, product.id, product.seller_id)} style={{ marginTop: 12 }}>
              <button type="submit" className="btn-primary">
                💬 판매자에게 문의하기
              </button>
            </form>
          ) : null}
        </div>

        {/* 댓글 섹션 */}
        <CommentsSection
          productId={product.id}
          comments={comments ?? []}
          currentUserId={user?.id ?? null}
        />
      </main>
    </div>
  );
}
