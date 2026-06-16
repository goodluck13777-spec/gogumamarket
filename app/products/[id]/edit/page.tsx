import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/app/_components/Header";
import { ProductEditForm } from "@/app/products/_components/ProductEditForm";

export default async function ProductEditPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: product } = await supabase
    .from("products")
    .select("id, title, price, description, category, image_url, seller_id")
    .eq("id", id)
    .maybeSingle();

  if (!product) notFound();
  if (product.seller_id !== user.id) redirect(`/products/${id}`);

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Header user={user} />

      <main
        style={{ flex: 1, width: "100%", maxWidth: 480, margin: "0 auto", padding: "20px 16px 48px" }}
      >
        <Link
          href={`/products/${id}`}
          className="nav-btn nav-btn-ghost"
          style={{ display: "inline-block", marginBottom: 16 }}
        >
          ← 돌아가기
        </Link>

        <h2 style={{ fontWeight: 800, fontSize: 22, marginBottom: 20 }}>상품 수정</h2>

        {error ? (
          <div className="alert alert-error" style={{ marginBottom: 16 }}>
            {decodeURIComponent(error)}
          </div>
        ) : null}

        <ProductEditForm product={product} />
      </main>
    </div>
  );
}
