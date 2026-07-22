import { AlertTriangle, Package, Boxes } from "lucide-react";
import Pagination, { parsePage } from "@/components/admin/Pagination";
import AdminStatCard from "@/components/admin/AdminStatCard";

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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Inventory</h1>
        <p className="text-sm text-white/40 mt-0.5">{total} total products</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <AdminStatCard label="Total Products" value={total} icon={<Boxes size={17} />} glow="electric" />
        <AdminStatCard label="Low Stock (≤5)" value={lowStockCount} icon={<AlertTriangle size={17} />} glow="amber" delay={0.05} />
        <AdminStatCard label="Out of Stock" value={outOfStockCount} icon={<Package size={17} />} glow="red" delay={0.1} />
      </div>

      <div className="overflow-hidden rounded-2xl glass-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.03] text-left text-xs font-bold uppercase tracking-wider text-white/40">
                <th className="px-5 py-3">Product</th>
                <th className="px-5 py-3">SKU</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">Stock</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-5 py-3 font-semibold text-white/90 line-clamp-1 max-w-[200px]">{product.name}</td>
                  <td className="px-5 py-3 text-white/40">{product.sku}</td>
                  <td className="px-5 py-3 text-white/40">{product.category?.name}</td>
                  <td className="px-5 py-3 font-bold text-white">{product.stock}</td>
                  <td className="px-5 py-3">
                    {product.stock === 0 ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2.5 py-1 text-xs font-semibold text-red-400">
                        <AlertTriangle size={11} /> Out of Stock
                      </span>
                    ) : product.stock <= 5 ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-300">
                        <AlertTriangle size={11} /> Low Stock
                      </span>
                    ) : (
                      <span className="rounded-full bg-cyan/10 px-2.5 py-1 text-xs font-semibold text-cyan">
                        In Stock
                      </span>
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
