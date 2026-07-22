import { Layers } from "lucide-react";
import Pagination, { parsePage } from "@/components/admin/Pagination";
import CatalogEntityRow from "@/components/admin/CatalogEntityRow";
import NewCatalogEntityForm from "@/components/admin/NewCatalogEntityForm";
import { createCategory, updateCategory, toggleCategoryActive, deleteCategory } from "./actions";

// Adapted from hardvanta/src/app/admin/categories/page.js — searchParams is
// a Promise in Next.js 16 (awaited below), import path updated, and
// Pagination's basePath remapped /admin/categories -> /dashboard/categories.
export const dynamic = "force-dynamic";
export const metadata = { title: "Categories — Admin" };

const PAGE_SIZE = 20;

export default async function CategoriesPage({ searchParams: searchParamsPromise }) {
  const searchParams = await searchParamsPromise;
  const { prisma } = await import("@/lib/database/prisma");

  const page = parsePage(searchParams);
  const [categories, total] = await Promise.all([
    prisma.category.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { products: true } } },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.category.count(),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Categories</h1>
          <p className="text-sm text-white/40 mt-0.5">{total} total categories</p>
        </div>
        <NewCatalogEntityForm label="category" onCreate={createCategory} />
      </div>

      <div className="overflow-hidden rounded-2xl glass-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.03] text-left text-xs font-bold uppercase tracking-wider text-white/40">
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">Slug</th>
                <th className="px-5 py-3">Products</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-white/50">
                    <Layers size={32} className="mx-auto mb-2 text-white/20" />
                    No categories found
                  </td>
                </tr>
              ) : (
                categories.map((cat) => (
                  <CatalogEntityRow
                    key={cat.id}
                    item={cat}
                    productCount={cat._count.products}
                    onUpdate={updateCategory}
                    onToggleActive={toggleCategoryActive}
                    onDelete={deleteCategory}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination page={page} totalPages={totalPages} basePath="/dashboard/categories" />
    </div>
  );
}
