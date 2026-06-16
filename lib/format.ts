// 가격을 "850,000원" 형태로 표시
export function formatPrice(price: number): string {
  return price.toLocaleString("ko-KR") + "원";
}

// 등록 시각을 "5분 전", "3시간 전" 같은 상대 시간으로 표시
export function timeAgo(dateString: string): string {
  const diffMs = Date.now() - new Date(dateString).getTime();
  const minutes = Math.floor(diffMs / 60000);

  if (minutes < 1) return "방금 전";
  if (minutes < 60) return `${minutes}분 전`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}일 전`;

  const date = new Date(dateString);
  return `${date.getMonth() + 1}월 ${date.getDate()}일`;
}
