import { toggleLike } from "@/app/products/actions";
import Link from "next/link";

interface Props {
  productId: string;
  likeCount: number;
  isLiked: boolean;
  isLoggedIn: boolean;
}

export function LikeButton({ productId, likeCount, isLiked, isLoggedIn }: Props) {
  if (!isLoggedIn) {
    return (
      <Link
        href="/login"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          padding: "8px 16px",
          borderRadius: 12,
          border: "1.5px solid rgba(45,36,64,0.12)",
          background: "rgba(255,255,255,0.5)",
          color: "var(--text-dim)",
          fontWeight: 700,
          fontSize: 14,
          textDecoration: "none",
        }}
      >
        <span style={{ fontSize: 18 }}>🤍</span>
        <span>{likeCount}</span>
      </Link>
    );
  }

  return (
    <form action={toggleLike.bind(null, productId, isLiked)}>
      <button
        type="submit"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          padding: "8px 16px",
          borderRadius: 12,
          border: isLiked ? "1.5px solid rgba(255,77,109,0.4)" : "1.5px solid rgba(45,36,64,0.12)",
          background: isLiked ? "rgba(255,77,109,0.1)" : "rgba(255,255,255,0.5)",
          color: isLiked ? "#ff4d6d" : "var(--text-dim)",
          fontWeight: 700,
          fontSize: 14,
          cursor: "pointer",
          transition: "all 0.2s",
        }}
      >
        <span style={{ fontSize: 18 }}>{isLiked ? "❤️" : "🤍"}</span>
        <span>{likeCount}</span>
      </button>
    </form>
  );
}
