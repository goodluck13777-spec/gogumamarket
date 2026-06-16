"use client";

import { deleteProduct } from "@/app/products/actions";

export function DeleteProductButton({ productId }: { productId: string }) {
  const action = deleteProduct.bind(null, productId);

  return (
    <form
      action={action}
      style={{ flex: 1 }}
      onSubmit={(e) => {
        if (!window.confirm("정말 삭제할까요? 이 작업은 취소할 수 없어요.")) {
          e.preventDefault();
        }
      }}
    >
      <button
        type="submit"
        style={{
          width: "100%",
          padding: "10px",
          borderRadius: "12px",
          border: "1.5px solid rgba(255, 77, 109, 0.4)",
          background: "rgba(255, 77, 109, 0.08)",
          color: "#d63a5f",
          cursor: "pointer",
          fontWeight: 700,
          fontSize: 13,
          transition: "all 0.15s ease",
        }}
      >
        🗑️ 삭제하기
      </button>
    </form>
  );
}
