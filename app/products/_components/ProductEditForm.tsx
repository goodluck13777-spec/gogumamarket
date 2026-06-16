"use client";

import { useRef, useState } from "react";
import { updateProduct } from "@/app/products/actions";
import { SubmitButton } from "@/app/_components/SubmitButton";

const CATEGORIES = [
  "디지털기기",
  "생활가전",
  "가구/인테리어",
  "의류",
  "뷰티/미용",
  "도서",
  "기타",
];

type Props = {
  product: {
    id: string;
    title: string;
    price: number;
    description: string | null;
    category: string | null;
    image_url: string | null;
  };
};

export function ProductEditForm({ product }: Props) {
  const [newPreview, setNewPreview] = useState<string | null>(null);
  const [deleteFlag, setDeleteFlag] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const boundAction = updateProduct.bind(null, product.id);

  // 실제 미리보기에 표시할 이미지 결정
  const displaySrc = deleteFlag ? null : (newPreview ?? product.image_url);

  function onImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setNewPreview(URL.createObjectURL(file));
      setDeleteFlag(false);
    } else {
      setNewPreview(null);
    }
  }

  function handleDeleteImage() {
    setDeleteFlag(true);
    setNewPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <form action={boundAction} style={{ display: "grid", gap: 14 }}>
      {/* 이미지 영역 */}
      <div style={{ display: "grid", gap: 8 }}>
        <label
          htmlFor="edit-image"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            height: 180,
            borderRadius: 18,
            border: "2px dashed rgba(255,138,61,0.45)",
            background: displaySrc ? "transparent" : "rgba(255,138,61,0.06)",
            cursor: "pointer",
            overflow: "hidden",
            position: "relative",
          }}
        >
          {displaySrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={displaySrc}
              alt="미리보기"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <>
              <span style={{ fontSize: 34 }}>📷</span>
              <span style={{ fontSize: 13, color: "var(--text-dim)", fontWeight: 600 }}>
                사진 변경하기 (최대 5MB)
              </span>
            </>
          )}
        </label>

        {displaySrc ? (
          <button
            type="button"
            onClick={handleDeleteImage}
            style={{
              padding: "8px 16px",
              borderRadius: 10,
              border: "1.5px solid rgba(255,77,109,0.4)",
              background: "rgba(255,77,109,0.08)",
              color: "#d63a5f",
              cursor: "pointer",
              fontWeight: 700,
              fontSize: 13,
            }}
          >
            🗑️ 사진 삭제
          </button>
        ) : null}
      </div>

      <input
        id="edit-image"
        type="file"
        name="image"
        accept="image/*"
        onChange={onImageChange}
        ref={fileInputRef}
        style={{ display: "none" }}
      />
      {/* 이미지 삭제 여부를 서버에 전달 */}
      <input type="hidden" name="delete_image" value={deleteFlag ? "1" : "0"} />

      <input
        className="field"
        type="text"
        name="title"
        placeholder="상품 제목"
        defaultValue={product.title}
        maxLength={100}
        required
      />

      <div style={{ position: "relative" }}>
        <input
          className="field"
          type="number"
          name="price"
          placeholder="가격"
          defaultValue={product.price}
          min={0}
          required
          style={{ paddingRight: 40 }}
        />
        <span
          style={{
            position: "absolute",
            right: 16,
            top: "50%",
            transform: "translateY(-50%)",
            color: "var(--text-dim)",
            fontSize: 14,
            fontWeight: 700,
          }}
        >
          원
        </span>
      </div>

      <select className="field" name="category" defaultValue={product.category ?? ""}>
        <option value="" disabled>
          카테고리 선택
        </option>
        {CATEGORIES.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>

      <textarea
        className="field"
        name="description"
        placeholder="상품 설명을 자세히 적어주세요 :)"
        defaultValue={product.description ?? ""}
        rows={5}
        maxLength={2000}
        style={{ resize: "vertical", lineHeight: 1.5 }}
      />

      <SubmitButton pendingText="수정 중...">수정 완료</SubmitButton>
    </form>
  );
}
