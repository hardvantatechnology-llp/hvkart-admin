import { notFound } from "next/navigation";
import ProductForm from "@/components/admin/ProductForm";
import PageHeader from "@/components/admin/ui/PageHeader";

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
      <PageHeader title="Edit Product" />
      <ProductForm product={product} />
    </div>
  );
}
