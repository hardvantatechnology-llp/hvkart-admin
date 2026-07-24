import Link from "next/link";
import { Ticket, CheckCircle2, XCircle, Clock3, Award, IndianRupee } from "lucide-react";
import Pagination, { parsePage } from "@/components/admin/Pagination";
import AdminSearchInput from "@/components/admin/AdminSearchInput";
import AdminStatCard from "@/components/admin/AdminStatCard";
import ExportButtons from "@/components/admin/ExportButtons";
import AddCouponButton from "@/components/admin/AddCouponButton";
import CouponRow from "@/components/admin/CouponRow";
import { formatPrice } from "@/utils/formatPrice";
import { buildCouponWhere } from "@/lib/couponFilters";
import PageHeader from "@/components/admin/ui/PageHeader";
import { createCoupon, updateCoupon, toggleCouponActive, deleteCoupon } from "./actions";

// Adapted from hardvanta/src/app/admin/coupons/page.js — searchParams is a
// Promise in Next.js 16 (awaited below), import paths updated, and all
// /admin/coupons hrefs remapped to /dashboard/coupons. No business logic changed.
export const dynamic = "force-dynamic";
export const metadata = { title: "Coupons — Admin" };

const PAGE_SIZE = 20;

const FILTERS = [
  { key: "active", label: "Active" },
  { key: "inactive", label: "Inactive" },
  { key: "expired", label: "Expired" },
  { key: "scheduled", label: "Scheduled" },
  { key: "percent", label: "Percentage" },
  { key: "flat", label: "Flat Discount" },
];

export default async function AdminCouponsPage({ searchParams: searchParamsPromise }) {
  const searchParams = await searchParamsPromise;
  const { prisma } = await import("@/lib/database/prisma");

  const page = parsePage(searchParams);
  const q = searchParams?.q?.trim() || "";
  const filter = searchParams?.filter || "";
  const now = new Date();

  const where = buildCouponWhere({ filter, q });

  const [
    coupons,
    total,
    totalCoupons,
    activeCoupons,
    inactiveCoupons,
    expiredCoupons,
    mostUsed,
    discountAgg,
  ] = await Promise.all([
    prisma.coupon.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.coupon.count({ where }),
    prisma.coupon.count({ where: { deletedAt: null } }),
    prisma.coupon.count({ where: { deletedAt: null, active: true } }),
    prisma.coupon.count({ where: { deletedAt: null, active: false } }),
    prisma.coupon.count({ where: { deletedAt: null, expiresAt: { lt: now } } }),
    prisma.coupon.findFirst({
      where: { deletedAt: null, usedCount: { gt: 0 } },
      orderBy: { usedCount: "desc" },
    }),
    prisma.order.aggregate({
      where: { status: { not: "CANCELLED" } },
      _sum: { discountAmount: true },
    }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function filterHref(key) {
    const params = new URLSearchParams(searchParams);
    if (key) params.set("filter", key);
    else params.delete("filter");
    params.delete("page");
    const qs = params.toString();
    return `/dashboard/coupons${qs ? `?${qs}` : ""}`;
  }

  return (
    <div>
      <PageHeader
        title="Coupons"
        description={`${totalCoupons} total coupons`}
        actions={
          <>
            <ExportButtons endpoint="/api/admin/coupons/export" params={{ filter, q }} />
            <AddCouponButton onCreate={createCoupon} />
          </>
        }
      />

      <div className="grid grid-cols-2 gap-4 mb-6 lg:grid-cols-3 xl:grid-cols-6">
        <AdminStatCard label="Total Coupons" value={totalCoupons} icon={<Ticket size={17} />} glow="electric" />
        <AdminStatCard label="Active Coupons" value={activeCoupons} icon={<CheckCircle2 size={17} />} glow="cyan" delay={0.03} />
        <AdminStatCard label="Inactive Coupons" value={inactiveCoupons} icon={<XCircle size={17} />} glow="amber" delay={0.06} />
        <AdminStatCard label="Expired Coupons" value={expiredCoupons} icon={<Clock3 size={17} />} glow="red" delay={0.09} />
        <AdminStatCard label="Most Used Coupon" value={mostUsed ? `${mostUsed.code} (${mostUsed.usedCount})` : "—"} icon={<Award size={17} />} glow="purple" delay={0.12} />
        <AdminStatCard label="Total Discounts Given" value={formatPrice(discountAgg._sum.discountAmount || 0)} icon={<IndianRupee size={17} />} glow="electric" delay={0.15} />
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <AdminSearchInput placeholder="Search by coupon code…" basePath="/dashboard/coupons" searchParams={searchParams} />
        <div className="flex flex-wrap gap-1.5">
          <Link
            href={filterHref(null)}
            className={`admin-focus-ring rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
              !filter ? "bg-admin-accent text-white" : "border border-admin-border bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            All
          </Link>
          {FILTERS.map((f) => (
            <Link
              key={f.key}
              href={filterHref(f.key)}
              className={`admin-focus-ring rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                filter === f.key ? "bg-admin-accent text-white" : "border border-admin-border bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              {f.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="admin-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-admin-border bg-slate-50/80">
                <th className="admin-th">Code</th>
                <th className="admin-th">Description</th>
                <th className="admin-th">Type</th>
                <th className="admin-th">Discount</th>
                <th className="admin-th">Min Order</th>
                <th className="admin-th">Max Discount</th>
                <th className="admin-th">Start Date</th>
                <th className="admin-th">Expiry Date</th>
                <th className="admin-th">Usage Limit</th>
                <th className="admin-th">Used Count</th>
                <th className="admin-th">Status</th>
                <th className="admin-th">Created</th>
                <th className="admin-th text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-admin-border">
              {coupons.length === 0 ? (
                <tr>
                  <td colSpan={13} className="px-5 py-12 text-center text-slate-500">
                    <Ticket size={32} className="mx-auto mb-2 text-slate-300" />
                    No coupons found
                  </td>
                </tr>
              ) : (
                coupons.map((coupon) => (
                  <CouponRow
                    key={coupon.id}
                    coupon={coupon}
                    onUpdate={updateCoupon}
                    onToggleActive={toggleCouponActive}
                    onDelete={deleteCoupon}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination page={page} totalPages={totalPages} basePath="/dashboard/coupons" searchParams={searchParams} />
    </div>
  );
}
