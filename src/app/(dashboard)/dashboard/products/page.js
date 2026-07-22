import { prisma } from "@/lib/database/prisma";
import { Plus, PackageSearch } from "lucide-react";
import Pagination, { parsePage } from "@/components/admin/Pagination";
import AdminSearchInput from "@/components/admin/AdminSearchInput";
import ProductsTable from "@/components/admin/ProductsTable";
import Button from "@/components/ui/Button";

// Adapted from hardvanta/src/app/admin/products/page.js — searchParams is a
// Promise in Next.js 16 (was a plain object in hardvanta's Next 14), so it's
// awaited once here before use. Hrefs remapped /admin/products -> /dashboard/products.
export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

export default async function AdminProductsPage({ searchParams: searchParamsPromise }) {
  const searchParams = await searchParamsPromise;
  const page = parsePage(searchParams);
  const q = searchParams?.q?.trim();
  const where = q
    ? {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { sku: { contains: q, mode: "insensitive" } },
        ],
      }
    : {};

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        category: true,
        brand: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.product.count({ where }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-white">
          Products ({total})
        </h1>

        <Button href="/dashboard/products/new" variant="gradient">
          <Plus size={18} />
          Add Product
        </Button>
      </div>

      <div className="mb-4">
        <AdminSearchInput
          placeholder="Search by name or SKU…"
          basePath="/dashboard/products"
          searchParams={searchParams}
        />
      </div>

      {products.length === 0 ? (
        <div className="glass-card flex flex-col items-center gap-2 rounded-2xl py-16 text-center">
          <PackageSearch size={32} className="text-white/20" />
          <p className="text-white/60">No products found{q ? ` for "${q}"` : ""}.</p>
        </div>
      ) : (
        <ProductsTable products={products} />
      )}

      <Pagination page={page} totalPages={totalPages} basePath="/dashboard/products" searchParams={searchParams} />
    </div>
  );
}
