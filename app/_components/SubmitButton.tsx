"use client";

import { useFormStatus } from "react-dom";

// 폼 제출 중에는 버튼을 비활성화하고 로딩 문구를 보여줍니다.
export function SubmitButton({
  children,
  pendingText = "처리 중...",
}: {
  children: React.ReactNode;
  pendingText?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary" disabled={pending}>
      {pending ? pendingText : children}
    </button>
  );
}
