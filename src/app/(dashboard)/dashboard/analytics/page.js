import { TrendingUp, ShoppingCart, Users, Package } from "lucide-react";
import { formatPrice } from "@/utils/formatPrice";
import AdminStatCard from "@/components/admin/AdminStatCard";
import AdminBarStat from "@/components/admin/AdminBarStat";
import PageHeader from "@/components/admin/ui/PageHeader";
import Badge from "@/components/admin/ui/Badge";

// Adapted from hardvanta/src/app/admin/analytics/page.js — import path
// updated only (no searchParams, no route remapping needed beyond location).
export const dynamic = "force-dynamic";
export const metadata = { title: "Analytics — Admin" };

const STATUS_TONE = {
  DELIVERED: "green",
  CANCELLED: "red",
  SHIPPED: "purple",
  PROCESSING: "blue",
  PENDING: "amber",
};

export default async function AnalyticsPage() {
  const { prisma } = await import("@/lib/database/prisma");

  const [
    totalRevenue,
    totalOrders,
    totalCustomers,
    totalProducts,
    recentOrders,
    ordersByStatus,
  ] = await Promise.all([
    // Cancelled orders were never fulfilled/paid-through — excluding them
    // matches how /admin/coupons already computes revenue elsewhere.
    prisma.order.aggregate({ where: { status: { not: "CANCELLED" } }, _sum: { total: true } }),
    prisma.order.count(),
    prisma.user.count({ where: { role: "USER" } }),
    prisma.product.count(),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        total: true,
        status: true,
        user: { select: { name: true } },
        _count: { select: { items: true } },
      },
    }),
    prisma.order.groupBy({
      by: ["status"],
      _count: { status: true },
    }),
  ]);

  const revenue = totalRevenue._sum.total || 0;

  return (
    <div>
      <PageHeader title="Analytics" description="Store performance overview" />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6 lg:grid-cols-4">
        <AdminStatCard label="Total Revenue" value={formatPrice(revenue)} icon={<TrendingUp size={17} />} glow="cyan" />
        <AdminStatCard label="Total Orders" value={totalOrders} icon={<ShoppingCart size={17} />} glow="electric" delay={0.05} />
        <AdminStatCard label="Customers" value={totalCustomers} icon={<Users size={17} />} glow="purple" delay={0.1} />
        <AdminStatCard label="Products" value={totalProducts} icon={<Package size={17} />} glow="amber" delay={0.15} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2 mb-4">
        {/* Orders by Status */}
        <div className="admin-card p-5">
          <h2 className="text-base font-semibold text-slate-900 mb-4">Orders by Status</h2>
          <div className="space-y-3">
            {ordersByStatus.map((s) => {
              const pct = totalOrders > 0 ? Math.round((s._count.status / totalOrders) * 100) : 0;
              return <AdminBarStat key={s.status} label={s.status} count={s._count.status} pct={pct} />;
            })}
          </div>
        </div>

        {/* Average Order Value */}
        <div className="admin-card p-5">
          <h2 className="text-base font-semibold text-slate-900 mb-4">Key Metrics</h2>
          <div className="space-y-4">
            {[
              { label: "Average Order Value", value: totalOrders > 0 ? formatPrice(Math.round(revenue / totalOrders)) : "₹0" },
              { label: "Total Revenue", value: formatPrice(revenue) },
              { label: "Completed Orders", value: ordersByStatus.find(s => s.status === "DELIVERED")?._count.status || 0 },
              { label: "Cancelled Orders", value: ordersByStatus.find(s => s.status === "CANCELLED")?._count.status || 0 },
            ].map((m) => (
              <div key={m.label} className="flex justify-between items-center border-b border-admin-border pb-3 last:border-0 last:pb-0">
                <span className="text-sm text-slate-500">{m.label}</span>
                <span className="text-sm font-bold text-slate-900">{m.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="admin-card overflow-hidden">
        <div className="px-5 py-4 border-b border-admin-border">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-admin-accent">Recent Orders</h2>
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
              </tr>
            </thead>
            <tbody className="divide-y divide-admin-border">
              {recentOrders.map((order) => (
                <tr key={order.id} className="admin-row-hover">
                  <td className="admin-td font-semibold text-admin-accent">#{order.id.slice(-8).toUpperCase()}</td>
                  <td className="admin-td text-slate-400">{order.user?.name || "—"}</td>
                  <td className="admin-td text-slate-400">{order._count.items}</td>
                  <td className="admin-td font-bold text-slate-900">{formatPrice(order.total)}</td>
                  <td className="admin-td">
                    <Badge tone={STATUS_TONE[order.status] || "slate"}>{order.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
