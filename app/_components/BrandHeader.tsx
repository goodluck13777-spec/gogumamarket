import Link from "next/link";

// 고구마 로고 + 브랜드명 (인증 화면 상단)
export function BrandHeader({ subtitle }: { subtitle?: string }) {
  return (
    <div style={{ textAlign: "center", marginBottom: 26 }}>
      <Link
        href="/"
        style={{ textDecoration: "none", display: "inline-block" }}
      >
        <div
          style={{
            fontSize: 48,
            lineHeight: 1,
            display: "inline-block",
            animation: "floaty 4s ease-in-out infinite",
            filter: "drop-shadow(0 6px 14px rgba(245,185,77,0.35))",
          }}
        >
          🍠
        </div>
      </Link>
      <h1
        className="brand-gradient"
        style={{
          fontSize: 28,
          fontWeight: 800,
          letterSpacing: 2,
          margin: "10px 0 4px",
        }}
      >
        고구마마켓
      </h1>
      {subtitle ? (
        <p
          style={{
            color: "var(--text-dim)",
            fontSize: 13,
            letterSpacing: 1,
            margin: 0,
          }}
        >
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}
