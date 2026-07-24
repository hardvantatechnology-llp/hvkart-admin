import { formatPrice } from "@/utils/formatPrice";
import { formatDate } from "@/utils/formatDateTime";
import Pagination, { parsePage } from "@/components/admin/Pagination";
import AdminStatCard from "@/components/admin/AdminStatCard";
import { IndianRupee, CheckCircle2, ShoppingCart, XCircle } from "lucide-react";
import PageHeader from "@/components/admin/ui/PageHeader";
import Badge from "@/components/admin/ui/Badge";

// Adapted from hardvanta/src/app/admin/reports/page.js — searchParams is a
// Promise in Next.js 16 (awaited below), import path updated, and
// Pagination's basePath remapped /admin/reports -> /dashboard/reports.
export const dynamic = "force-dynamic";
export const metadata = { title: "Reports — Admin" };

const PAGE_SIZE = 20;

const STATUS_TONE = {
  DELIVERED: "green",
  CANCELLED: "red",
  SHIPPED: "purple",
  PROCESSING: "blue",
  PENDING: "amber",
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
      <PageHeader title="Reports" description="Sales and performance reports" />

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 mb-6 lg:grid-cols-4">
        <AdminStatCard label="Total Revenue" value={formatPrice(totalRevenue)} icon={<IndianRupee size={17} />} glow="electric" />
        <AdminStatCard label="Delivered Revenue" value={formatPrice(deliveredRevenue)} icon={<CheckCircle2 size={17} />} glow="cyan" delay={0.05} />
        <AdminStatCard label="Total Orders" value={totalOrderCount} icon={<ShoppingCart size={17} />} glow="purple" delay={0.1} />
        <AdminStatCard label="Cancelled" value={cancelledCount} icon={<XCircle size={17} />} glow="red" delay={0.15} />
      </div>

      {/* Top Products */}
      <div className="admin-card overflow-hidden mb-4">
        <div className="px-5 py-4 border-b border-admin-border">
          <p className="text-sm font-semibold uppercase tracking-wider text-admin-accent">Top Selling Products</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-admin-border bg-slate-50/80">
                <th className="admin-th">#</th>
                <th className="admin-th">Product</th>
                <th className="admin-th">Units Sold</th>
                <th className="admin-th">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-admin-border">
              {topProducts.map((p, i) => (
                <tr key={p.productId} className="admin-row-hover">
                  <td className="admin-td font-bold text-slate-400">{i + 1}</td>
                  <td className="admin-td font-semibold text-slate-900">{p.productName}</td>
                  <td className="admin-td text-slate-400">{p._sum.quantity}</td>
                  <td className="admin-td font-bold text-slate-900">
                    {formatPrice((p._sum.price || 0) * (p._sum.quantity || 0))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* All Orders Table */}
      <div className="admin-card overflow-hidden">
        <div className="px-5 py-4 border-b border-admin-border flex items-center justify-between">
          <p className="text-sm font-semibold uppercase tracking-wider text-admin-accent">All Orders</p>
          <span className="text-xs text-slate-400">{totalOrderCount} orders</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-admin-border bg-slate-50/80">
                <th className="admin-th">Order</th>
                <th className="admin-th">Customer</th>
                <th className="admin-th">Items</th>
                <th className="admin-th">Total</th>
                <th className="admin-th">Status</th>
                <th className="admin-th">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-admin-border">
              {orders.map((order) => (
                <tr key={order.id} className="admin-row-hover">
                  <td className="admin-td font-semibold text-admin-accent">#{order.id.slice(-8).toUpperCase()}</td>
                  <td className="admin-td text-slate-400">{order.user?.name || "—"}</td>
                  <td className="admin-td text-slate-400">{order._count.items}</td>
                  <td className="admin-td font-bold text-slate-900">{formatPrice(order.total)}</td>
                  <td className="admin-td">
                    <Badge tone={STATUS_TONE[order.status] || "slate"}>{order.status}</Badge>
                  </td>
                  <td className="admin-td text-slate-400">
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
