import { formatPrice } from "@/utils/formatPrice";
import { formatDate } from "@/utils/formatDateTime";
import Pagination, { parsePage } from "@/components/admin/Pagination";
import AdminStatCard from "@/components/admin/AdminStatCard";
import { IndianRupee, CheckCircle2, ShoppingCart, XCircle } from "lucide-react";

// Adapted from hardvanta/src/app/admin/reports/page.js — searchParams is a
// Promise in Next.js 16 (awaited below), import path updated, and
// Pagination's basePath remapped /admin/reports -> /dashboard/reports.
export const dynamic = "force-dynamic";
export const metadata = { title: "Reports — Admin" };

const PAGE_SIZE = 20;

const STATUS_STYLES = {
  DELIVERED: "bg-cyan/10 text-cyan",
  CANCELLED: "bg-red-500/10 text-red-400",
  SHIPPED: "bg-liquid/10 text-liquid-light",
  PROCESSING: "bg-electric/10 text-electric-light",
  PENDING: "bg-amber-500/10 text-amber-300",
};

export default async function ReportsPage({ searchParams: searchParamsPromise }) {
  const searchParams = await searchParamsPromise;
  const { prisma } = await import("@/lib/database/prisma");

  const page = parsePage(searchParams);

  const [
    orders,
    totalOrderCount,
    revenueAgg,
    deliveredAgg,
    cancelledCount,
    topProducts,
  ] = await Promise.all([
    prisma.order.findMany({
      select: {
        id: true,
        total: true,
        status: true,
        createdAt: true,
        user: { select: { name: true } },
        _count: { select: { items: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.order.count(),
    // Cancelled orders were never fulfilled/paid-through — excluding them
    // matches how /admin/coupons already computes revenue elsewhere.
    prisma.order.aggregate({ where: { status: { not: "CANCELLED" } }, _sum: { total: true } }),
    prisma.order.aggregate({ where: { status: "DELIVERED" }, _sum: { total: true }, _count: true }),
    prisma.order.count({ where: { status: "CANCELLED" } }),
    prisma.orderItem.groupBy({
      by: ["productId", "productName"],
      where: { order: { status: { not: "CANCELLED" } } },
      _sum: { quantity: true, price: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 10,
    }),
  ]);
  const totalPages = Math.max(1, Math.ceil(totalOrderCount / PAGE_SIZE));

  const totalRevenue = revenueAgg._sum.total || 0;
  const deliveredRevenue = deliveredAgg._sum.total || 0;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Reports</h1>
        <p className="text-sm text-white/40 mt-0.5">Sales and performance reports</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 mb-6 lg:grid-cols-4">
        <AdminStatCard label="Total Revenue" value={formatPrice(totalRevenue)} icon={<IndianRupee size={17} />} glow="electric" />
        <AdminStatCard label="Delivered Revenue" value={formatPrice(deliveredRevenue)} icon={<CheckCircle2 size={17} />} glow="cyan" delay={0.05} />
        <AdminStatCard label="Total Orders" value={totalOrderCount} icon={<ShoppingCart size={17} />} glow="purple" delay={0.1} />
        <AdminStatCard label="Cancelled" value={cancelledCount} icon={<XCircle size={17} />} glow="red" delay={0.15} />
      </div>

      {/* Top Products */}
      <div className="glass-strong rounded-2xl overflow-hidden mb-4">
        <div className="px-5 py-4 border-b border-white/10">
          <p className="text-xs font-bold uppercase tracking-wider text-electric-light">Top Selling Products</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left text-xs font-bold uppercase tracking-wider text-white/40">
                <th className="px-5 py-3">#</th>
                <th className="px-5 py-3">Product</th>
                <th className="px-5 py-3">Units Sold</th>
                <th className="px-5 py-3">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {topProducts.map((p, i) => (
                <tr key={p.productId} className="hover:bg-white/5 transition-colors">
                  <td className="px-5 py-3 font-bold text-white/40">{i + 1}</td>
                  <td className="px-5 py-3 font-semibold text-white/90">{p.productName}</td>
                  <td className="px-5 py-3 text-white/40">{p._sum.quantity}</td>
                  <td className="px-5 py-3 font-bold text-white">
                    {formatPrice((p._sum.price || 0) * (p._sum.quantity || 0))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* All Orders Table */}
      <div className="glass-strong rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-wider text-electric-light">All Orders</p>
          <span className="text-xs text-white/40">{totalOrderCount} orders</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left text-xs font-bold uppercase tracking-wider text-white/40">
                <th className="px-5 py-3">Order</th>
                <th className="px-5 py-3">Customer</th>
                <th className="px-5 py-3">Items</th>
                <th className="px-5 py-3">Total</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-5 py-3 font-semibold text-electric-light">#{order.id.slice(-8).toUpperCase()}</td>
                  <td className="px-5 py-3 text-white/40">{order.user?.name || "—"}</td>
                  <td className="px-5 py-3 text-white/40">{order._count.items}</td>
                  <td className="px-5 py-3 font-bold text-white">{formatPrice(order.total)}</td>
                  <td className="px-5 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[order.status] || "bg-white/10 text-white"}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-white/40">
                    {formatDate(order.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination page={page} totalPages={totalPages} basePath="/dashboard/reports" />
    </div>
  );
}
