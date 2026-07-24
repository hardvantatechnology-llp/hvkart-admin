import { FileText } from "lucide-react";
import { formatPrice } from "@/utils/formatPrice";
import { formatDate } from "@/utils/formatDateTime";
import Pagination, { parsePage } from "@/components/admin/Pagination";
import PageHeader from "@/components/admin/ui/PageHeader";
import EmptyState from "@/components/admin/ui/EmptyState";

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
      <PageHeader title="Invoices" description={`${total} total invoices`} />

      {invoices.length === 0 ? (
        <EmptyState icon={FileText} title="No invoices found" />
      ) : (
        <div className="admin-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-admin-border bg-slate-50/80">
                  <th className="admin-th">Invoice #</th>
                  <th className="admin-th">Customer</th>
                  <th className="admin-th">Subtotal</th>
                  <th className="admin-th">Tax</th>
                  <th className="admin-th">Total</th>
                  <th className="admin-th">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-admin-border">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="admin-row-hover">
                    <td className="admin-td font-bold text-admin-accent">{inv.invoiceNumber}</td>
                    <td className="admin-td text-slate-500">{inv.order?.user?.name || "—"}</td>
                    <td className="admin-td text-slate-700">{formatPrice(inv.subtotal)}</td>
                    <td className="admin-td text-slate-700">{formatPrice(inv.tax)}</td>
                    <td className="admin-td font-bold text-slate-900">{formatPrice(inv.total)}</td>
                    <td className="admin-td text-slate-400">
                      {formatDate(inv.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} basePath="/dashboard/invoices" />
    </div>
  );
}
