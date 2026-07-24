import { Layers } from "lucide-react";
import Pagination, { parsePage } from "@/components/admin/Pagination";
import CatalogEntityRow from "@/components/admin/CatalogEntityRow";
import NewCatalogEntityForm from "@/components/admin/NewCatalogEntityForm";
import PageHeader from "@/components/admin/ui/PageHeader";
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
      <PageHeader
        title="Categories"
        description={`${total} total categories`}
        actions={<NewCatalogEntityForm label="category" onCreate={createCategory} />}
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
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-slate-500">
                    <Layers size={32} className="mx-auto mb-2 text-slate-300" />
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
