"use client";

import { useState } from "react";
import { createProduct } from "@/app/products/actions";
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

export function ProductForm() {
  const [preview, setPreview] = useState<string | null>(null);

  function onImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setPreview(file ? URL.createObjectURL(file) : null);
  }

  return (
    <form action={createProduct} style={{ display: "grid", gap: 14 }}>
      {/* 이미지 업로드 */}
      <label
        htmlFor="image"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          height: 180,
          borderRadius: 18,
          border: "2px dashed rgba(255,138,61,0.45)",
          background: preview ? "transparent" : "rgba(255,138,61,0.06)",
          cursor: "pointer",
          overflow: "hidden",
          position: "relative",
        }}
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview}
            alt="미리보기"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <>
            <span style={{ fontSize: 34 }}>📷</span>
            <span style={{ fontSize: 13, color: "var(--text-dim)", fontWeight: 600 }}>
              사진 추가 (선택 · 최대 5MB)
            </span>
          </>
        )}
      </label>
      <input
        id="image"
        type="file"
        name="image"
        accept="image/*"
        onChange={onImageChange}
        style={{ display: "none" }}
      />

      <input
        className="field"
        type="text"
        name="title"
        placeholder="상품 제목 (예: 아이폰 14 프로 팝니다)"
        maxLength={100}
        required
      />

      <div style={{ position: "relative" }}>
        <input
          className="field"
          type="number"
          name="price"
          placeholder="가격"
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

      <select className="field" name="category" defaultValue="">
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
        rows={5}
        maxLength={2000}
        style={{ resize: "vertical", lineHeight: 1.5 }}
      />

      <SubmitButton pendingText="등록 중...">상품 등록하기</SubmitButton>
    </form>
  );
}
