import { AlertTriangle, Package, Boxes } from "lucide-react";
import Pagination, { parsePage } from "@/components/admin/Pagination";
import AdminStatCard from "@/components/admin/AdminStatCard";
import PageHeader from "@/components/admin/ui/PageHeader";
import Badge from "@/components/admin/ui/Badge";

// Adapted from hardvanta/src/app/admin/inventory/page.js — searchParams is a
// Promise in Next.js 16 (awaited below), import path updated, and
// Pagination's basePath remapped /admin/inventory -> /dashboard/inventory.
// Read-only page, no business logic changed.
export const dynamic = "force-dynamic";
export const metadata = { title: "Inventory — Admin" };

const PAGE_SIZE = 20;

export default async function InventoryPage({ searchParams: searchParamsPromise }) {
  const searchParams = await searchParamsPromise;
  const { prisma } = await import("@/lib/database/prisma");

  const page = parsePage(searchParams);
  const [products, total, outOfStockCount, lowStockCount] = await Promise.all([
    prisma.product.findMany({
      orderBy: { stock: "asc" },
      select: {
        id: true,
        name: true,
        sku: true,
        stock: true,
        category: { select: { name: true } },
      },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.product.count(),
    prisma.product.count({ where: { stock: 0 } }),
    prisma.product.count({ where: { stock: { gt: 0, lte: 5 } } }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div>
      <PageHeader title="Inventory" description={`${total} total products`} />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <AdminStatCard label="Total Products" value={total} icon={<Boxes size={17} />} glow="electric" />
        <AdminStatCard label="Low Stock (≤5)" value={lowStockCount} icon={<AlertTriangle size={17} />} glow="amber" delay={0.05} />
        <AdminStatCard label="Out of Stock" value={outOfStockCount} icon={<Package size={17} />} glow="red" delay={0.1} />
      </div>

      <div className="admin-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-admin-border bg-slate-50/80">
                <th className="admin-th">Product</th>
                <th className="admin-th">SKU</th>
                <th className="admin-th">Category</th>
                <th className="admin-th">Stock</th>
                <th className="admin-th">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-admin-border">
              {products.map((product) => (
                <tr key={product.id} className="admin-row-hover">
                  <td className="admin-td font-semibold text-slate-900 line-clamp-1 max-w-[200px]">{product.name}</td>
                  <td className="admin-td text-slate-400">{product.sku}</td>
                  <td className="admin-td text-slate-400">{product.category?.name}</td>
                  <td className="admin-td font-bold text-slate-900">{product.stock}</td>
                  <td className="admin-td">
                    {product.stock === 0 ? (
                      <Badge tone="red" dot>Out of Stock</Badge>
                    ) : product.stock <= 5 ? (
                      <Badge tone="amber" dot>Low Stock</Badge>
                    ) : (
                      <Badge tone="green">In Stock</Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination page={page} totalPages={totalPages} basePath="/dashboard/inventory" />
    </div>
  );
}
