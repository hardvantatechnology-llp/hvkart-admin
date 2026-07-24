import { FileText } from "lucide-react";
import { formatPrice } from "@/utils/formatPrice";
import { formatDate } from "@/utils/formatDateTime";
import Pagination, { parsePage } from "@/components/admin/Pagination";

// Adapted from hardvanta/src/app/admin/invoices/page.js — searchParams is a
// Promise in Next.js 16 (awaited below), import path updated, and
// Pagination's basePath remapped /admin/invoices -> /dashboard/invoices.
export const dynamic = "force-dynamic";
export const metadata = { title: "Invoices — Admin" };

const PAGE_SIZE = 20;

export default async function InvoicesPage({ searchParams: searchParamsPromise }) {
  const searchParams = await searchParamsPromise;
  const { prisma } = await import("@/lib/database/prisma");

  const page = parsePage(searchParams);
  const [invoices, total] = await Promise.all([
    prisma.invoice.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        invoiceNumber: true,
        subtotal: true,
        tax: true,
        total: true,
        createdAt: true,
        order: { select: { user: { select: { name: true } } } },
      },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.invoice.count(),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Invoices</h1>
        <p className="text-sm text-white/40 mt-0.5">{total} total invoices</p>
      </div>

      <div className="overflow-hidden rounded-2xl glass-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.03] text-left text-xs font-bold uppercase tracking-wider text-white/40">
                <th className="px-5 py-3">Invoice #</th>
                <th className="px-5 py-3">Customer</th>
                <th className="px-5 py-3">Subtotal</th>
                <th className="px-5 py-3">Tax</th>
                <th className="px-5 py-3">Total</th>
                <th className="px-5 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-white/50">
                    <FileText size={32} className="mx-auto mb-2 text-white/20" />
                    No invoices found
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-5 py-3 font-bold text-electric-light">{inv.invoiceNumber}</td>
                    <td className="px-5 py-3 text-white/50">{inv.order?.user?.name || "—"}</td>
                    <td className="px-5 py-3 text-white/80">{formatPrice(inv.subtotal)}</td>
                    <td className="px-5 py-3 text-white/80">{formatPrice(inv.tax)}</td>
                    <td className="px-5 py-3 font-bold text-white">{formatPrice(inv.total)}</td>
                    <td className="px-5 py-3 text-white/40">
                      {formatDate(inv.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination page={page} totalPages={totalPages} basePath="/dashboard/invoices" />
    </div>
  );
}
