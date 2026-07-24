import { Tag } from "lucide-react";
import Pagination, { parsePage } from "@/components/admin/Pagination";
import CatalogEntityRow from "@/components/admin/CatalogEntityRow";
import NewCatalogEntityForm from "@/components/admin/NewCatalogEntityForm";
import PageHeader from "@/components/admin/ui/PageHeader";
import { createBrand, updateBrand, toggleBrandActive, deleteBrand } from "./actions";

// Adapted from hardvanta/src/app/admin/brands/page.js — searchParams is a
// Promise in Next.js 16 (awaited below), import path updated, and
// Pagination's basePath remapped /admin/brands -> /dashboard/brands.
export const dynamic = "force-dynamic";
export const metadata = { title: "Brands — Admin" };

const PAGE_SIZE = 20;

export default async function BrandsPage({ searchParams: searchParamsPromise }) {
  const searchParams = await searchParamsPromise;
  const { prisma } = await import("@/lib/database/prisma");

  const page = parsePage(searchParams);
  const [brands, total] = await Promise.all([
    prisma.brand.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { products: true } } },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.brand.count(),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div>
      <PageHeader
        title="Brands"
        description={`${total} total brands`}
        actions={<NewCatalogEntityForm label="brand" onCreate={createBrand} />}
      />

      <div className="admin-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-admin-border bg-slate-50/80">
                <th className="admin-th">Name</th>
                <th className="admin-th">Slug</th>
                <th className="admin-th">Products</th>
                <th className="admin-th">Status</th>
                <th className="admin-th text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-admin-border">
              {brands.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-slate-500">
                    <Tag size={32} className="mx-auto mb-2 text-slate-300" />
                    No brands found
                  </td>
                </tr>
              ) : (
                brands.map((brand) => (
                  <CatalogEntityRow
                    key={brand.id}
                    item={brand}
                    productCount={brand._count.products}
                    onUpdate={updateBrand}
                    onToggleActive={toggleBrandActive}
                    onDelete={deleteBrand}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination page={page} totalPages={totalPages} basePath="/dashboard/brands" />
    </div>
  );
}
