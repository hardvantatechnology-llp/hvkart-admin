import { notFound } from "next/navigation";
import ProductForm from "@/components/admin/ProductForm";

// Adapted from hardvanta/src/app/admin/products/[id]/edit/page.js — params is
// a Promise in Next.js 16 (was a plain object in hardvanta's Next 14), so
// it's awaited here. Import path updated to lib/database/prisma.
export const dynamic = "force-dynamic";

export default async function EditProductPage({ params }) {
  const { id } = await params;
  const { prisma } = await import("@/lib/database/prisma");
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
      brand: true,
    },
  });
  if (!product) notFound();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-white">Edit Product</h1>
      <ProductForm product={product} />
    </div>
  );
}
