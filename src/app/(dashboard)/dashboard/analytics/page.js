import { TrendingUp, ShoppingCart, Users, Package } from "lucide-react";
import { formatPrice } from "@/utils/formatPrice";
import AdminStatCard from "@/components/admin/AdminStatCard";
import AdminBarStat from "@/components/admin/AdminBarStat";

// Adapted from hardvanta/src/app/admin/analytics/page.js — import path
// updated only (no searchParams, no route remapping needed beyond location).
export const dynamic = "force-dynamic";
export const metadata = { title: "Analytics — Admin" };

const STATUS_STYLES = {
  DELIVERED: "bg-cyan/10 text-cyan",
  CANCELLED: "bg-red-500/10 text-red-400",
  SHIPPED: "bg-liquid/10 text-liquid-light",
  PROCESSING: "bg-electric/10 text-electric-light",
  PENDING: "bg-amber-500/10 text-amber-300",
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Analytics</h1>
        <p className="text-sm text-white/40 mt-0.5">Store performance overview</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6 lg:grid-cols-4">
        <AdminStatCard label="Total Revenue" value={formatPrice(revenue)} icon={<TrendingUp size={17} />} glow="cyan" />
        <AdminStatCard label="Total Orders" value={totalOrders} icon={<ShoppingCart size={17} />} glow="electric" delay={0.05} />
        <AdminStatCard label="Customers" value={totalCustomers} icon={<Users size={17} />} glow="purple" delay={0.1} />
        <AdminStatCard label="Products" value={totalProducts} icon={<Package size={17} />} glow="amber" delay={0.15} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2 mb-4">
        {/* Orders by Status */}
        <div className="glass-strong rounded-2xl p-5">
          <h2 className="text-base font-bold text-white mb-4">Orders by Status</h2>
          <div className="space-y-3">
            {ordersByStatus.map((s) => {
              const pct = totalOrders > 0 ? Math.round((s._count.status / totalOrders) * 100) : 0;
              return <AdminBarStat key={s.status} label={s.status} count={s._count.status} pct={pct} />;
            })}
          </div>
        </div>

        {/* Average Order Value */}
        <div className="glass-strong rounded-2xl p-5">
          <h2 className="text-base font-bold text-white mb-4">Key Metrics</h2>
          <div className="space-y-4">
            {[
              { label: "Average Order Value", value: totalOrders > 0 ? formatPrice(Math.round(revenue / totalOrders)) : "₹0" },
              { label: "Total Revenue", value: formatPrice(revenue) },
              { label: "Completed Orders", value: ordersByStatus.find(s => s.status === "DELIVERED")?._count.status || 0 },
              { label: "Cancelled Orders", value: ordersByStatus.find(s => s.status === "CANCELLED")?._count.status || 0 },
            ].map((m) => (
              <div key={m.label} className="flex justify-between items-center border-b border-white/10 pb-3 last:border-0 last:pb-0">
                <span className="text-sm text-white/50">{m.label}</span>
                <span className="text-sm font-bold text-white">{m.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="glass-strong rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-white/10">
          <h2 className="text-sm font-bold uppercase tracking-wider text-electric-light">Recent Orders</h2>
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
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {recentOrders.map((order) => (
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
