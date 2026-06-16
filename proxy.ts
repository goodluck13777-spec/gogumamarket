import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Next.js 16: 기존 `middleware`가 `proxy`로 이름이 바뀌었습니다.
// 매 요청마다 Supabase 인증 세션(쿠키)을 갱신합니다.
export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    // 정적 파일과 이미지를 제외한 모든 경로에서 세션을 갱신
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
