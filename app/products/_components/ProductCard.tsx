import Link from "next/link";
import { formatPrice, timeAgo } from "@/lib/format";

export type ProductCardData = {
  id: string;
  title: string;
  price: number;
  category: string | null;
  image_url: string | null;
  status: string;
  created_at: string;
};

const STATUS_LABEL: Record<string, string> = {
  reserved: "예약중",
  sold: "거래완료",
};

// 마켓 목록에 보이는 상품 한 칸
export function ProductCard({ product }: { product: ProductCardData }) {
  const badge = STATUS_LABEL[product.status];

  return (
    <Link href={`/products/${product.id}`} className="product-card">
      <div className="product-card-image-wrap">
        {product.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.image_url} alt={product.title} className="product-card-image" />
        ) : (
          <div className="product-card-image-placeholder">🍠</div>
        )}
        {badge ? <span className="product-card-status-badge">{badge}</span> : null}
      </div>
      <div className="product-card-body">
        <p className="product-card-title">{product.title}</p>
        <p className="product-card-price">{formatPrice(product.price)}</p>
        <div className="product-card-meta">
          {product.category ? <span className="product-card-tag">{product.category}</span> : null}
          <span>{timeAgo(product.created_at)}</span>
        </div>
      </div>
    </Link>
  );
}
