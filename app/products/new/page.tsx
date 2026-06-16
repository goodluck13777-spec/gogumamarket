import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProductForm } from "@/app/products/_components/ProductForm";

export default async function NewProductPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  // 로그인하지 않았다면 로그인 페이지로
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await searchParams;

  return (
    <main
      style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <div className="glass-card" style={{ width: "100%", maxWidth: 460, padding: 32 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
          <Link href="/" className="btn-ghost" style={{ padding: "8px 12px" }}>
            ←
          </Link>
          <h1
            className="brand-gradient"
            style={{ fontSize: 22, fontWeight: 800, margin: 0, letterSpacing: 1 }}
          >
            🍠 상품 등록
          </h1>
        </div>

        {error ? (
          <div className="alert alert-error" style={{ marginBottom: 16 }}>
            {error}
          </div>
        ) : null}

        <ProductForm />
      </div>
    </main>
  );
}
