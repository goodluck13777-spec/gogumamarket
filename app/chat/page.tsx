import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/app/_components/Header";
import { formatPrice } from "@/lib/format";

type ChatRoomRow = {
  id: string;
  buyer_id: string;
  seller_id: string;
  product: {
    id: string;
    title: string;
    price: number;
    image_url: string | null;
  } | null;
};

export default async function ChatListPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: rooms } = await supabase
    .from("chat_rooms")
    .select("id, buyer_id, seller_id, product:products(id, title, price, image_url)")
    .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
    .order("created_at", { ascending: false });

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Header user={user} />

      <main style={{ flex: 1, width: "100%", maxWidth: 640, margin: "0 auto", padding: "20px 16px 48px" }}>
        <h1 className="detail-title" style={{ marginBottom: 16 }}>
          채팅
        </h1>

        {rooms && rooms.length > 0 ? (
          <div className="chat-room-list">
            {(rooms as unknown as ChatRoomRow[]).map((room) => (
              <Link key={room.id} href={`/chat/${room.id}`} className="chat-room-item">
                {room.product?.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={room.product.image_url} alt={room.product.title} className="chat-room-thumb" />
                ) : (
                  <div className="chat-room-thumb-placeholder">🍠</div>
                )}
                <div className="chat-room-info">
                  <p className="chat-room-title">{room.product?.title ?? "삭제된 상품"}</p>
                  {room.product ? (
                    <p className="product-card-price" style={{ fontSize: 14, margin: "0 0 4px" }}>
                      {formatPrice(room.product.price)}
                    </p>
                  ) : null}
                  <span className="chat-room-role">
                    {user.id === room.buyer_id ? "구매 문의" : "판매 문의"}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div style={{ fontSize: 48, marginBottom: 12 }}>💬</div>
            <p style={{ fontWeight: 700, color: "var(--text)" }}>아직 채팅이 없어요</p>
          </div>
        )}
      </main>
    </div>
  );
}
