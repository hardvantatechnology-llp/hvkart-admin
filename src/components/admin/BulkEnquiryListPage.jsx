import Link from "next/link";
import Pagination, { parsePage } from "@/components/admin/Pagination";
import AdminSearchInput from "@/components/admin/AdminSearchInput";
import ExportButtons from "@/components/admin/ExportButtons";
import EnquiryStatusSelect from "@/components/admin/EnquiryStatusSelect";
import { ENQUIRY_STATUSES, ENQUIRY_STATUS_LABELS } from "@/lib/enquiryStatus";
import { Inbox } from "lucide-react";

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
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">{title} ({total})</h1>
          {description && <p className="text-sm text-white/40 mt-0.5">{description}</p>}
        </div>
        <ExportButtons params={{ type: exportType }} />
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <AdminSearchInput
          placeholder="Search by name, email, or company…"
          basePath={basePath}
          searchParams={searchParams}
        />
        <div className="flex flex-wrap gap-1.5">
          <Link
            href={statusHref(null)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
              !status ? "bg-gradient-to-r from-electric to-liquid text-white shadow-glow-electric" : "glass text-white/60 hover:text-white"
            }`}
          >
            All
          </Link>
          {ENQUIRY_STATUSES.map((s) => (
            <Link
              key={s}
              href={statusHref(s)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                status === s ? "bg-gradient-to-r from-electric to-liquid text-white shadow-glow-electric" : "glass text-white/60 hover:text-white"
              }`}
            >
              {ENQUIRY_STATUS_LABELS[s]}
            </Link>
          ))}
        </div>
      </div>

      {enquiries.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl glass-card py-16 text-center">
          <Inbox size={40} className="mb-3 text-white/20" />
          <p className="font-semibold text-white">No enquiries found</p>
        </div>
      ) : (
        <div className="glass-strong rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left text-xs font-bold uppercase tracking-wider text-white/40">
                  <th className="px-5 py-3">Name</th>
                  <th className="px-5 py-3">Company</th>
                  <th className="px-5 py-3">Email</th>
                  <th className="px-5 py-3">Phone</th>
                  <th className="px-5 py-3">Product</th>
                  <th className="px-5 py-3">Quantity</th>
                  <th className="px-5 py-3">Message</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {enquiries.map((e) => (
                  <tr key={e.id} className="hover:bg-white/5 transition-colors align-top">
                    <td className="px-5 py-3 font-semibold text-white/90 whitespace-nowrap">{e.name}</td>
                    <td className="px-5 py-3 text-white/60 whitespace-nowrap">{e.organization || "—"}</td>
                    <td className="px-5 py-3 text-white/60 whitespace-nowrap">{e.email}</td>
                    <td className="px-5 py-3 text-white/60 whitespace-nowrap">{e.phone}</td>
                    <td className="px-5 py-3 text-white/60 max-w-xs truncate" title={e.products}>{e.products}</td>
                    <td className="px-5 py-3 text-white/60 whitespace-nowrap">{e.quantity}</td>
                    <td className="px-5 py-3 text-white/40 max-w-xs truncate" title={e.message || ""}>{e.message || "—"}</td>
                    <td className="px-5 py-3 text-white/40 whitespace-nowrap">
                      {new Date(e.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-5 py-3">
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
