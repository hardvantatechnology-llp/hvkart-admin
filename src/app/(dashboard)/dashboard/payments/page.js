import { CreditCard } from "lucide-react";
import { formatPrice } from "@/utils/formatPrice";
import Pagination, { parsePage } from "@/components/admin/Pagination";
import { PAYMENT_STATUS_META } from "@/lib/orderStatus";
import { formatDate } from "@/utils/formatDateTime";

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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Payments</h1>
        <p className="text-sm text-white/40 mt-0.5">{total} total payments</p>
      </div>

      <div className="overflow-hidden rounded-2xl glass-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.03] text-left text-xs font-bold uppercase tracking-wider text-white/40">
                <th className="px-5 py-3">Order</th>
                <th className="px-5 py-3">Customer</th>
                <th className="px-5 py-3">Method</th>
                <th className="px-5 py-3">Amount</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-white/50">
                    <CreditCard size={32} className="mx-auto mb-2 text-white/20" />
                    No payments found
                  </td>
                </tr>
              ) : (
                payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-5 py-3 font-semibold text-electric-light">#{payment.orderId.slice(-8).toUpperCase()}</td>
                    <td className="px-5 py-3 text-white/50">{payment.order?.user?.name || "—"}</td>
                    <td className="px-5 py-3 text-white/50">{payment.method}</td>
                    <td className="px-5 py-3 font-bold text-white">{formatPrice(payment.amount)}</td>
                    <td className="px-5 py-3">
                      {(() => {
                        const meta = PAYMENT_STATUS_META[payment.status] || PAYMENT_STATUS_META.PENDING;
                        return (
                          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${meta.className}`}>
                            {meta.label}
                          </span>
                        );
                      })()}
                    </td>
                    <td className="px-5 py-3 text-white/40">
                      {formatDate(payment.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination page={page} totalPages={totalPages} basePath="/dashboard/payments" />
    </div>
  );
}
