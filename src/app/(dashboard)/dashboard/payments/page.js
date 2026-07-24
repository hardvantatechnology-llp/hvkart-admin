import { CreditCard } from "lucide-react";
import { formatPrice } from "@/utils/formatPrice";
import Pagination, { parsePage } from "@/components/admin/Pagination";
import { PAYMENT_STATUS_META_ADMIN } from "@/lib/orderStatus";
import { formatDate } from "@/utils/formatDateTime";
import PageHeader from "@/components/admin/ui/PageHeader";
import EmptyState from "@/components/admin/ui/EmptyState";
import Badge from "@/components/admin/ui/Badge";

// Adapted from hardvanta/src/app/admin/payments/page.js — searchParams is a
// Promise in Next.js 16 (awaited below), import path updated, and
// Pagination's basePath remapped /admin/payments -> /dashboard/payments.
export const dynamic = "force-dynamic";
export const metadata = { title: "Payments — Admin" };

const PAGE_SIZE = 20;

export default async function PaymentsPage({ searchParams: searchParamsPromise }) {
  const searchParams = await searchParamsPromise;
  const { prisma } = await import("@/lib/database/prisma");

  const page = parsePage(searchParams);
  const [payments, total] = await Promise.all([
    prisma.payment.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        orderId: true,
        method: true,
        amount: true,
        status: true,
        createdAt: true,
        order: { select: { user: { select: { name: true } } } },
      },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.payment.count(),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div>
      <PageHeader title="Payments" description={`${total} total payments`} />

      {payments.length === 0 ? (
        <EmptyState icon={CreditCard} title="No payments found" />
      ) : (
        <div className="admin-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-admin-border bg-slate-50/80">
                  <th className="admin-th">Order</th>
                  <th className="admin-th">Customer</th>
                  <th className="admin-th">Method</th>
                  <th className="admin-th">Amount</th>
                  <th className="admin-th">Status</th>
                  <th className="admin-th">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-admin-border">
                {payments.map((payment) => (
                  <tr key={payment.id} className="admin-row-hover">
                    <td className="admin-td font-semibold text-admin-accent">#{payment.orderId.slice(-8).toUpperCase()}</td>
                    <td className="admin-td text-slate-500">{payment.order?.user?.name || "—"}</td>
                    <td className="admin-td text-slate-500">{payment.method}</td>
                    <td className="admin-td font-bold text-slate-900">{formatPrice(payment.amount)}</td>
                    <td className="admin-td">
                      {(() => {
                        const meta = PAYMENT_STATUS_META_ADMIN[payment.status] || PAYMENT_STATUS_META_ADMIN.PENDING;
                        return <Badge tone={meta.tone}>{meta.label}</Badge>;
                      })()}
                    </td>
                    <td className="admin-td text-slate-400">
                      {formatDate(payment.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} basePath="/dashboard/payments" />
    </div>
  );
}
