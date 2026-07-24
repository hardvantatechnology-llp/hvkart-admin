import Link from "next/link";
import { formatPrice } from "@/utils/formatPrice";
import OrderStatusSelect from "@/components/admin/OrderStatusSelect";
import AdminCancelOrderButton from "@/components/admin/AdminCancelOrderButton";
import Pagination, { parsePage } from "@/components/admin/Pagination";
import AdminSearchInput from "@/components/admin/AdminSearchInput";
import { PackageSearch } from "lucide-react";
import { PAYMENT_STATUS_META_ADMIN } from "@/lib/orderStatus";
import { formatDate } from "@/utils/formatDateTime";
import PageHeader from "@/components/admin/ui/PageHeader";
import EmptyState from "@/components/admin/ui/EmptyState";
import Badge from "@/components/admin/ui/Badge";

const STATUS_TONE = {
  PENDING: "amber",
  PROCESSING: "blue",
  SHIPPED: "purple",
  OUT_FOR_DELIVERY: "blue",
  DELIVERED: "green",
  CANCELLED: "red",
};

// Adapted from hardvanta/src/app/admin/orders/page.js — searchParams is a
// Promise in Next.js 16 (awaited below), import paths updated, and all
// /admin/orders hrefs remapped to /dashboard/orders. No business logic changed.
export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;
const STATUSES = ["PENDING", "PROCESSING", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"];

export default async function AdminOrdersPage({ searchParams: searchParamsPromise }) {
  const searchParams = await searchParamsPromise;
  const { prisma } = await import("@/lib/database/prisma");
  const page = parsePage(searchParams);
  const q = searchParams?.q?.trim();
  const status = searchParams?.status;

  const where = {
    ...(status ? { status } : {}),
    ...(q
      ? {
          user: {
            OR: [
              { email: { contains: q, mode: "insensitive" } },
              { name: { contains: q, mode: "insensitive" } },
            ],
          },
        }
      : {}),
  };

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { items: true, payment: true, user: { select: { email: true, name: true } } },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.order.count({ where }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function statusHref(s) {
    const params = new URLSearchParams(searchParams);
    if (s) params.set("status", s);
    else params.delete("status");
    params.delete("page");
    const qs = params.toString();
    return `/dashboard/orders${qs ? `?${qs}` : ""}`;
  }

  return (
    <div>
      <PageHeader title={`Orders (${total})`} />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <AdminSearchInput placeholder="Search by customer name or email…" basePath="/dashboard/orders" searchParams={searchParams} />
        <div className="flex flex-wrap gap-1.5">
          <Link
            href={statusHref(null)}
            className={`admin-focus-ring rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
              !status ? "bg-admin-accent text-white" : "border border-admin-border bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            All
          </Link>
          {STATUSES.map((s) => (
            <Link
              key={s}
              href={statusHref(s)}
              className={`admin-focus-ring rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                status === s ? "bg-admin-accent text-white" : "border border-admin-border bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              {s}
            </Link>
          ))}
        </div>
      </div>

      {orders.length === 0 ? (
        <EmptyState icon={PackageSearch} title="No orders found" description="Try a different status filter or search term." />
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <div key={o.id} className="admin-card p-5">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-admin-border pb-3">
                <div>
                  <p className="font-semibold text-slate-900">
                    #{o.id.slice(-8).toUpperCase()}
                  </p>
                  <p className="text-xs text-slate-400">
                    {o.user?.email} · {formatDate(o.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge tone={o.paymentMethod === "ONLINE" ? "green" : "amber"}>
                    {o.paymentMethod === "ONLINE" ? "Paid Online" : "Cash on Delivery"}
                  </Badge>
                  {o.payment && (() => {
                    const meta = PAYMENT_STATUS_META_ADMIN[o.payment.status] || PAYMENT_STATUS_META_ADMIN.PENDING;
                    return <Badge tone={meta.tone}>{meta.label}</Badge>;
                  })()}
                  <OrderStatusSelect id={o.id} status={o.status} />
                  <AdminCancelOrderButton id={o.id} status={o.status} />
                </div>
              </div>

              <div className="space-y-1 py-3 text-sm">
                {o.items.map((it) => (
                  <div key={it.id} className="flex justify-between">
                    <span className="text-slate-500">{it.productName} × {it.quantity}</span>
                    <span className="font-medium text-slate-900">
                      {formatPrice(it.price * it.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {o.address && (
                <p className="border-t border-admin-border pt-2 text-xs text-slate-400">
                  Ship to: {[o.address.fullName, o.address.line1, o.address.city, o.address.state, o.address.pincode].filter(Boolean).join(", ")}
                  {o.address.phone ? ` · ${o.address.phone}` : ""}
                </p>
              )}

              <div className="flex justify-between border-t border-admin-border pt-3 text-sm font-bold text-slate-900">
                <span>Total</span>
                <span>{formatPrice(o.total)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} basePath="/dashboard/orders" searchParams={searchParams} />
    </div>
  );
}
