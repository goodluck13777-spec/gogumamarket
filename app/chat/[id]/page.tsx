import { Fragment } from "react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/app/_components/Header";
import { formatPrice, timeAgo } from "@/lib/format";
import { sendMessage, createReview } from "@/app/chat/actions";

type ChatRoomDetail = {
  id: string;
  buyer_id: string;
  seller_id: string;
  product: {
    id: string;
    title: string;
    price: number;
    image_url: string | null;
    status: string;
  } | null;
};

export default async function ChatRoomPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: roomData } = await supabase
    .from("chat_rooms")
    .select("id, buyer_id, seller_id, product:products(id, title, price, image_url, status)")
    .eq("id", id)
    .maybeSingle();

  const room = roomData as unknown as ChatRoomDetail | null;

  if (!room) notFound();
  if (user.id !== room.buyer_id && user.id !== room.seller_id) notFound();

  const { data: messages } = await supabase
    .from("messages")
    .select("id, sender_id, content, created_at")
    .eq("room_id", id)
    .order("created_at", { ascending: true });

  const isSold = room.product?.status === "sold";
  const isBuyer = user.id === room.buyer_id;

  const { data: review } = isSold && room.product
    ? await supabase
        .from("reviews")
        .select("rating, content")
        .eq("product_id", room.product.id)
        .eq("reviewer_id", room.buyer_id)
        .maybeSingle()
    : { data: null };

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Header user={user} />

      <main style={{ flex: 1, width: "100%", maxWidth: 640, margin: "0 auto", padding: "20px 16px 48px", display: "flex", flexDirection: "column" }}>
        <Link href="/chat" className="nav-btn nav-btn-ghost" style={{ display: "inline-block", marginBottom: 16, alignSelf: "flex-start" }}>
          ← 채팅 목록
        </Link>

        {room.product ? (
          <Link href={`/products/${room.product.id}`} className="chat-product-bar glass-card">
            {room.product.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={room.product.image_url} alt={room.product.title} className="chat-room-thumb" />
            ) : (
              <div className="chat-room-thumb-placeholder">🍠</div>
            )}
            <div className="chat-room-info">
              <p className="chat-room-title">{room.product.title}</p>
              <p className="product-card-price" style={{ fontSize: 14, margin: 0 }}>
                {formatPrice(room.product.price)}
              </p>
            </div>
          </Link>
        ) : null}

        <div className="chat-messages" style={{ flex: 1 }}>
          {messages && messages.length > 0 ? (
            messages.map((message) => {
              const mine = message.sender_id === user.id;
              return (
                <div
                  key={message.id}
                  className={`chat-bubble-row ${mine ? "chat-bubble-row-mine" : "chat-bubble-row-theirs"}`}
                >
                  <div className={`chat-bubble ${mine ? "chat-bubble-mine" : "chat-bubble-theirs"}`}>
                    {message.content}
                  </div>
                  <span className="chat-bubble-time">{timeAgo(message.created_at)}</span>
                </div>
              );
            })
          ) : (
            <div className="empty-state">
              <div style={{ fontSize: 48, marginBottom: 12 }}>💬</div>
              <p style={{ fontWeight: 700, color: "var(--text)" }}>첫 메시지를 보내보세요!</p>
            </div>
          )}
        </div>

        {isSold && room.product ? (
          review ? (
            <div className="review-card glass-card">
              <p className="review-stars">
                {"★".repeat(review.rating)}
                {"☆".repeat(5 - review.rating)}
              </p>
              {review.content ? <p className="review-content">{review.content}</p> : null}
            </div>
          ) : isBuyer ? (
            <form
              action={createReview.bind(null, room.id, room.product.id, room.seller_id)}
              className="review-form glass-card"
            >
              <p className="review-form-title">거래 후기를 남겨주세요</p>
              <div className="star-rating">
                {[5, 4, 3, 2, 1].map((value) => (
                  <Fragment key={value}>
                    <input
                      type="radio"
                      name="rating"
                      id={`star-${value}`}
                      value={value}
                      defaultChecked={value === 5}
                    />
                    <label htmlFor={`star-${value}`}>★</label>
                  </Fragment>
                ))}
              </div>
              <textarea name="content" className="field review-textarea" placeholder="거래는 어떠셨나요? (선택)" />
              <button type="submit" className="btn-primary">
                후기 남기기
              </button>
            </form>
          ) : null
        ) : null}

        <form action={sendMessage.bind(null, room.id)} className="chat-input-bar">
          <input
            type="text"
            name="content"
            className="field chat-input"
            placeholder="메시지를 입력하세요"
            autoComplete="off"
            required
          />
          <button type="submit" className="btn-primary chat-send-btn">
            전송
          </button>
        </form>
      </main>
    </div>
  );
}
