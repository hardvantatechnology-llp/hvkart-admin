import Link from "next/link";
import Pagination, { parsePage } from "@/components/admin/Pagination";
import AdminSearchInput from "@/components/admin/AdminSearchInput";
import ExportButtons from "@/components/admin/ExportButtons";
import EnquiryStatusSelect from "@/components/admin/EnquiryStatusSelect";
import { ENQUIRY_STATUSES, ENQUIRY_STATUS_LABELS } from "@/lib/enquiryStatus";
import { Inbox } from "lucide-react";
import PageHeader from "@/components/admin/ui/PageHeader";
import EmptyState from "@/components/admin/ui/EmptyState";

// Adapted from hardvanta/src/components/admin/BulkEnquiryListPage.jsx —
// import path updated and PATCH target /api/bulk-enquiry/[id] unchanged
// (route remapping applies to /admin -> /dashboard page routes, not this API).
const PAGE_SIZE = 20;

/**
 * Shared list view over the `BulkEnquiry` table, reused by the "B2B / Bulk
 * Orders" and "Bulk Enquiries" admin pages — they differ only in which
 * `enquiryType` values they filter to.
 */
export default async function BulkEnquiryListPage({
  searchParams,
  title,
  description,
  basePath,
  enquiryTypeFilter,
  exportType,
}) {
  const { prisma } = await import("@/lib/database/prisma");

  const page = parsePage(searchParams);
  const q = searchParams?.q?.trim();
  const status = searchParams?.status;

  const where = {
    ...enquiryTypeFilter,
    ...(status ? { status } : {}),
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
            { organization: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [enquiries, total] = await Promise.all([
    prisma.bulkEnquiry.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.bulkEnquiry.count({ where }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function statusHref(s) {
    const params = new URLSearchParams(searchParams);
    if (s) params.set("status", s);
    else params.delete("status");
    params.delete("page");
    const qs = params.toString();
    return `${basePath}${qs ? `?${qs}` : ""}`;
  }

  return (
    <div>
      <PageHeader
        title={`${title} (${total})`}
        description={description}
        actions={<ExportButtons params={{ type: exportType }} />}
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <AdminSearchInput
          placeholder="Search by name, email, or company…"
          basePath={basePath}
          searchParams={searchParams}
        />
        <div className="flex flex-wrap gap-1.5">
          <Link
            href={statusHref(null)}
            className={`admin-focus-ring rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
              !status ? "bg-admin-accent text-white" : "border border-admin-border bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            All
          </Link>
          {ENQUIRY_STATUSES.map((s) => (
            <Link
              key={s}
              href={statusHref(s)}
              className={`admin-focus-ring rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                status === s ? "bg-admin-accent text-white" : "border border-admin-border bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              {ENQUIRY_STATUS_LABELS[s]}
            </Link>
          ))}
        </div>
      </div>

      {enquiries.length === 0 ? (
        <EmptyState icon={Inbox} title="No enquiries found" />
      ) : (
        <div className="admin-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-admin-border bg-slate-50/80">
                  <th className="admin-th">Name</th>
                  <th className="admin-th">Company</th>
                  <th className="admin-th">Email</th>
                  <th className="admin-th">Phone</th>
                  <th className="admin-th">Product</th>
                  <th className="admin-th">Quantity</th>
                  <th className="admin-th">Message</th>
                  <th className="admin-th">Date</th>
                  <th className="admin-th">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-admin-border">
                {enquiries.map((e) => (
                  <tr key={e.id} className="admin-row-hover align-top">
                    <td className="admin-td font-semibold text-slate-900 whitespace-nowrap">{e.name}</td>
                    <td className="admin-td text-slate-500 whitespace-nowrap">{e.organization || "—"}</td>
                    <td className="admin-td text-slate-500 whitespace-nowrap">{e.email}</td>
                    <td className="admin-td text-slate-500 whitespace-nowrap">{e.phone}</td>
                    <td className="admin-td text-slate-500 max-w-xs truncate" title={e.products}>{e.products}</td>
                    <td className="admin-td text-slate-500 whitespace-nowrap">{e.quantity}</td>
                    <td className="admin-td text-slate-400 max-w-xs truncate" title={e.message || ""}>{e.message || "—"}</td>
                    <td className="admin-td text-slate-400 whitespace-nowrap">
                      {new Date(e.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className="admin-td">
                      <EnquiryStatusSelect endpoint={`/api/bulk-enquiry/${e.id}`} status={e.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} basePath={basePath} searchParams={searchParams} />
    </div>
  );
}
