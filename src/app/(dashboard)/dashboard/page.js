import Link from "next/link";
import {
  IndianRupee, Package, ShoppingCart, Users,
  History, Tag, BookOpen, ArrowRight, PackageSearch,
} from "lucide-react";

import { formatPrice } from "@/utils/formatPrice";
import { formatDateTime } from "@/utils/formatDateTime";
import StatCard from "@/components/admin/AdminStatCard";
import Badge from "@/components/admin/ui/Badge";
import PageHeader from "@/components/admin/ui/PageHeader";
import EmptyState from "@/components/admin/ui/EmptyState";

export const dynamic = "force-dynamic";

const STATUS_TONE = {
  PENDING: "amber",
  PROCESSING: "blue",
  SHIPPED: "purple",
  OUT_FOR_DELIVERY: "blue",
  DELIVERED: "green",
  CANCELLED: "red",
};

const QUICK_ACTIONS = [
  { label: "Add Product", href: "/dashboard/products/new", icon: Package },
  { label: "Add Coupon", href: "/dashboard/coupons", icon: Tag },
  { label: "Write Blog Post", href: "/dashboard/blogs/new", icon: BookOpen },
  { label: "View Orders", href: "/dashboard/orders", icon: ShoppingCart },
];

function pctChange(current, previous) {
  if (!previous) return current > 0 ? { value: 100, direction: "up" } : null;
  const pct = ((current - previous) / previous) * 100;
  return { value: Math.round(Math.abs(pct) * 10) / 10, direction: pct >= 0 ? "up" : "down" };
}

export default async function AdminDashboard() {
  const { prisma } = await import("@/lib/database/prisma");

  const now = new Date();
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const [
    productCount, orderCount, userCount, orders, revenue,
    revenueThisMonth, revenueLastMonth,
    ordersThisMonth, ordersLastMonth,
    productsThisMonth, productsLastMonth,
    usersThisMonth, usersLastMonth,
    lowStockProducts, recentActivity,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.order.count(),
    prisma.user.count(),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, total: true, status: true, createdAt: true, _count: { select: { items: true } } },
    }),
    prisma.order.aggregate({ where: { status: { not: "CANCELLED" } }, _sum: { total: true } }),
    prisma.order.aggregate({
      where: { status: { not: "CANCELLED" }, createdAt: { gte: startOfThisMonth } },
      _sum: { total: true },
    }),
    prisma.order.aggregate({
      where: { status: { not: "CANCELLED" }, createdAt: { gte: startOfLastMonth, lt: startOfThisMonth } },
      _sum: { total: true },
    }),
    prisma.order.count({ where: { createdAt: { gte: startOfThisMonth } } }),
    prisma.order.count({ where: { createdAt: { gte: startOfLastMonth, lt: startOfThisMonth } } }),
    prisma.product.count({ where: { createdAt: { gte: startOfThisMonth } } }),
    prisma.product.count({ where: { createdAt: { gte: startOfLastMonth, lt: startOfThisMonth } } }),
    prisma.user.count({ where: { createdAt: { gte: startOfThisMonth } } }),
    prisma.user.count({ where: { createdAt: { gte: startOfLastMonth, lt: startOfThisMonth } } }),
    prisma.product.findMany({
      where: { active: true, stock: { lte: 5 } },
      orderBy: { stock: "asc" },
      take: 5,
      select: { id: true, name: true, stock: true, sku: true },
    }),
    prisma.adminActivityLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, action: true, details: true, userEmail: true, createdAt: true },
    }),
  ]);

  const stats = [
    {
      label: "Revenue",
      value: formatPrice(revenue._sum.total || 0),
      icon: <IndianRupee size={17} />,
      glow: "cyan",
      trend: pctChange(revenueThisMonth._sum.total || 0, revenueLastMonth._sum.total || 0),
    },
    {
      label: "Orders",
      value: orderCount,
      icon: <ShoppingCart size={17} />,
      glow: "electric",
      trend: pctChange(ordersThisMonth, ordersLastMonth),
    },
    {
      label: "Products",
      value: productCount,
      icon: <Package size={17} />,
      glow: "purple",
      trend: pctChange(productsThisMonth, productsLastMonth),
    },
    {
      label: "Customers",
      value: userCount,
      icon: <Users size={17} />,
      glow: "amber",
      trend: pctChange(usersThisMonth, usersLastMonth),
    },
  ];

  return (
    <div>
      <PageHeader title="Dashboard" description="Welcome back — here's what's happening across your store today." />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s, i) => (
          <StatCard
            key={s.label}
            {...s}
            delay={i * 0.05}
            trend={s.trend ? { ...s.trend, label: "vs last month" } : undefined}
          />
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-3">
        {/* Recent Orders */}
        <div className="admin-card p-5 xl:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">Recent Orders</h2>
            <Link href="/dashboard/orders" className="flex items-center gap-1 text-sm font-medium text-admin-accent hover:text-admin-accent-dark">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          {orders.length === 0 ? (
            <EmptyState icon={PackageSearch} title="No orders yet" description="New orders will show up here as customers check out." />
          ) : (
            <div className="divide-y divide-admin-border">
              {orders.map((o) => (
                <div key={o.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm first:pt-0 last:pb-0">
                  <div className="min-w-[7rem]">
                    <p className="font-medium text-slate-900">#{o.id.slice(-8).toUpperCase()}</p>
                    <p className="text-xs text-slate-400">{formatDateTime(o.createdAt)}</p>
                  </div>
                  <span className="text-slate-500">{o._count.items} item{o._count.items !== 1 ? "s" : ""}</span>
                  <Badge tone={STATUS_TONE[o.status] || "slate"} dot>{o.status.replace(/_/g, " ")}</Badge>
                  <span className="font-semibold text-slate-900">{formatPrice(o.total)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="admin-card p-5">
          <h2 className="mb-4 text-base font-semibold text-slate-900">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-2.5">
            {QUICK_ACTIONS.map((a) => (
              <Link
                key={a.href}
                href={a.href}
                className="admin-focus-ring flex flex-col items-start gap-2 rounded-xl border border-admin-border p-3 text-sm font-medium text-slate-700 transition-colors hover:border-admin-accent/40 hover:bg-blue-50/50"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-admin-accent">
                  <a.icon size={15} />
                </span>
                {a.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
        {/* Low Stock */}
        <div className="admin-card p-5 xl:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">Low Stock</h2>
            <Link href="/dashboard/inventory" className="flex items-center gap-1 text-sm font-medium text-admin-accent hover:text-admin-accent-dark">
              Manage inventory <ArrowRight size={14} />
            </Link>
          </div>
          {lowStockProducts.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-500">All products are well stocked.</p>
          ) : (
            <div className="divide-y divide-admin-border">
              {lowStockProducts.map((p) => (
                <div key={p.id} className="flex items-center justify-between gap-3 py-3 text-sm first:pt-0 last:pb-0">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-slate-900">{p.name}</p>
                    <p className="text-xs text-slate-400">SKU {p.sku}</p>
                  </div>
                  <Badge tone={p.stock === 0 ? "red" : "amber"} dot>
                    {p.stock === 0 ? "Out of stock" : `${p.stock} left`}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="admin-card p-5">
          <h2 className="mb-4 text-base font-semibold text-slate-900">Recent Activity</h2>
          {recentActivity.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-500">No recent admin activity.</p>
          ) : (
            <ul className="space-y-4">
              {recentActivity.map((log) => (
                <li key={log.id} className="flex gap-3 text-sm">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                    <History size={14} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-slate-700">
                      <span className="font-medium text-slate-900">{log.userEmail}</span> {log.action}
                    </p>
                    <p className="text-xs text-slate-400">{formatDateTime(log.createdAt)}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
