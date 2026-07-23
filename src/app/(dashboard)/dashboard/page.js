import Link from "next/link";

import { formatPrice } from "@/utils/formatPrice";
import { Package, ShoppingCart, Users, IndianRupee } from "lucide-react";
import AdminStatCard from "@/components/admin/AdminStatCard";

// Adapted from hardvanta/src/app/admin/page.js — only the import path for
// prisma and the "View all" href (/admin/orders -> /dashboard/orders)
// changed. This replaces the Phase 1 placeholder ("Welcome, {name}" text)
// with hardvanta's actual Dashboard Home content, which was never migrated
// until now. Confirmed via direct read against current hardvanta HEAD: no
// charts, quick-action tiles, low-stock widget, or recent-customers/activity
// feed exist here — just the 4 stat cards and a 5-item recent-orders list
// below, exactly as implemented in hardvanta today.
export const dynamic = "force-dynamic";

const STATUS_STYLES = {
  PENDING: "bg-amber-500/10 text-amber-300",
  PROCESSING: "bg-electric/10 text-electric-light",
  SHIPPED: "bg-liquid/10 text-liquid-light",
  DELIVERED: "bg-cyan/10 text-cyan",
  CANCELLED: "bg-red-500/10 text-red-400",
};

export default async function AdminDashboard() {
  const { prisma } = await import("@/lib/database/prisma");
  const [productCount, orderCount, userCount, orders, revenue] = await Promise.all([
    prisma.product.count(),
    prisma.order.count(),
    prisma.user.count(),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        total: true,
        status: true,
        _count: { select: { items: true } },
      },
    }),
    // Cancelled orders were never fulfilled/paid-through — excluding them
    // matches how /admin/coupons already computes revenue elsewhere.
    prisma.order.aggregate({ where: { status: { not: "CANCELLED" } }, _sum: { total: true } }),
  ]);

  const stats = [
    { label: "Revenue", value: formatPrice(revenue._sum.total || 0), icon: <IndianRupee size={17} />, glow: "cyan" },
    { label: "Orders", value: orderCount, icon: <ShoppingCart size={17} />, glow: "electric" },
    { label: "Products", value: productCount, icon: <Package size={17} />, glow: "purple" },
    { label: "Customers", value: userCount, icon: <Users size={17} />, glow: "amber" },
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-white">Dashboard</h1>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s, i) => (
          <AdminStatCard key={s.label} {...s} delay={i * 0.05} />
        ))}
      </div>

      <div className="mt-8 glass-strong rounded-2xl p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Recent Orders</h2>
          <Link href="/dashboard/orders" className="text-sm font-semibold text-electric-light hover:text-cyan">
            View all
          </Link>
        </div>
        {orders.length === 0 ? (
          <p className="py-6 text-center text-sm text-white/40">No orders yet.</p>
        ) : (
          <div className="space-y-2">
            {orders.map((o) => (
              <div
                key={o.id}
                className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 py-2 text-sm last:border-0"
              >
                <span className="font-medium text-white/90">
                  #{o.id.slice(-8).toUpperCase()}
                </span>
                <span className="text-white/40">
                  {o._count.items} item{o._count.items !== 1 ? "s" : ""}
                </span>
                <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_STYLES[o.status] || "bg-white/10 text-white"}`}>
                  {o.status}
                </span>
                <span className="font-bold text-white">{formatPrice(o.total)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
