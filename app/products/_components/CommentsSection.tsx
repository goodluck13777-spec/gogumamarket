import { addComment, deleteComment } from "@/app/products/actions";
import { timeAgo } from "@/lib/format";
import Link from "next/link";

interface Comment {
  id: string;
  user_id: string;
  user_email: string;
  content: string;
  created_at: string;
}

interface Props {
  productId: string;
  comments: Comment[];
  currentUserId: string | null;
}

export function CommentsSection({ productId, comments, currentUserId }: Props) {
  return (
    <div className="glass-card" style={{ padding: 20, marginTop: 16 }}>
      <h2 style={{ fontSize: 15, fontWeight: 800, margin: "0 0 16px", color: "var(--text)" }}>
        댓글{comments.length > 0 ? ` (${comments.length})` : ""}
      </h2>

      {comments.length === 0 ? (
        <p style={{ color: "var(--text-dim)", fontSize: 13, textAlign: "center", padding: "16px 0 20px" }}>
          아직 댓글이 없어요. 첫 댓글을 남겨보세요! 💬
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
          {comments.map((comment) => (
            <div
              key={comment.id}
              style={{
                padding: "12px 14px",
                background: "rgba(255,255,255,0.6)",
                borderRadius: 14,
                border: "1px solid rgba(255,255,255,0.9)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: 6,
                  gap: 8,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 800,
                      color: "#7c3aed",
                      background: "rgba(168,85,247,0.1)",
                      padding: "2px 8px",
                      borderRadius: 8,
                    }}
                  >
                    {comment.user_email.split("@")[0]}
                  </span>
                  <span style={{ fontSize: 11, color: "var(--text-dim)" }}>
                    {timeAgo(comment.created_at)}
                  </span>
                </div>
                {currentUserId === comment.user_id && (
                  <form action={deleteComment.bind(null, comment.id, productId)}>
                    <button
                      type="submit"
                      style={{
                        padding: "2px 8px",
                        borderRadius: 8,
                        border: "1px solid rgba(255,77,109,0.3)",
                        background: "transparent",
                        color: "#ff4d6d",
                        fontSize: 11,
                        cursor: "pointer",
                        fontWeight: 700,
                        flexShrink: 0,
                      }}
                    >
                      삭제
                    </button>
                  </form>
                )}
              </div>
              <p
                style={{
                  margin: 0,
                  fontSize: 14,
                  lineHeight: 1.6,
                  color: "var(--text)",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}
              >
                {comment.content}
              </p>
            </div>
          ))}
        </div>
      )}

      {currentUserId ? (
        <form
          action={addComment.bind(null, productId)}
          style={{ display: "flex", flexDirection: "column", gap: 8 }}
        >
          <textarea
            name="content"
            placeholder="댓글을 입력해 주세요 (최대 500자)"
            maxLength={500}
            rows={3}
            required
            className="field"
            style={{ resize: "vertical", minHeight: 80 }}
          />
          <button type="submit" className="btn-primary" style={{ padding: "12px" }}>
            댓글 남기기
          </button>
        </form>
      ) : (
        <p style={{ textAlign: "center", color: "var(--text-dim)", fontSize: 13, padding: "8px 0 0" }}>
          <Link href="/login" style={{ color: "#ef5b1f", fontWeight: 700, textDecoration: "none" }}>
            로그인
          </Link>
          하면 댓글을 남길 수 있어요.
        </p>
      )}
    </div>
  );
}
