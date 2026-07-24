import Link from "next/link";
import Pagination, { parsePage } from "@/components/admin/Pagination";
import AdminSearchInput from "@/components/admin/AdminSearchInput";
import ExportButtons from "@/components/admin/ExportButtons";
import EnquiryStatusSelect from "@/components/admin/EnquiryStatusSelect";
import { ENQUIRY_STATUSES, ENQUIRY_STATUS_LABELS } from "@/lib/enquiryStatus";
import { Inbox } from "lucide-react";
import PageHeader from "@/components/admin/ui/PageHeader";
import EmptyState from "@/components/admin/ui/EmptyState";

// Adapted from hardvanta/src/app/admin/enquiries/atl-kits/page.js —
// searchParams is a Promise in Next.js 16 (awaited below), import path
// updated, and basePath remapped /admin/enquiries/atl-kits -> /dashboard/enquiries/atl-kits.
export const dynamic = "force-dynamic";
export const metadata = { title: "ATL Kits Enquiries — Admin" };

const PAGE_SIZE = 20;

export default async function AdminAtlKitsEnquiriesPage({ searchParams: searchParamsPromise }) {
  const searchParams = await searchParamsPromise;
  const { prisma } = await import("@/lib/database/prisma");
  const basePath = "/dashboard/enquiries/atl-kits";

  const page = parsePage(searchParams);
  const q = searchParams?.q?.trim();
  const status = searchParams?.status;

  const where = {
    ...(status ? { status } : {}),
    ...(q
      ? {
          OR: [
            { contactPerson: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
            { schoolName: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [enquiries, total] = await Promise.all([
    prisma.atlKitsEnquiry.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.atlKitsEnquiry.count({ where }),
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
        title={`ATL Kits Enquiries (${total})`}
        description="Submissions from the ATL Kits Enquiry page"
        actions={<ExportButtons params={{ type: "atl" }} />}
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <AdminSearchInput
          placeholder="Search by contact, email, or school…"
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
                  <th className="admin-th">School / Company</th>
                  <th className="admin-th">Email</th>
                  <th className="admin-th">Phone</th>
                  <th className="admin-th">Product (Kits)</th>
                  <th className="admin-th">Quantity</th>
                  <th className="admin-th">Message</th>
                  <th className="admin-th">Date</th>
                  <th className="admin-th">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-admin-border">
                {enquiries.map((e) => (
                  <tr key={e.id} className="admin-row-hover align-top">
                    <td className="admin-td font-semibold text-slate-900 whitespace-nowrap">{e.contactPerson}</td>
                    <td className="admin-td text-slate-500 whitespace-nowrap">{e.schoolName}</td>
                    <td className="admin-td text-slate-500 whitespace-nowrap">{e.email}</td>
                    <td className="admin-td text-slate-500 whitespace-nowrap">{e.phone}</td>
                    <td className="admin-td text-slate-500 max-w-xs truncate" title={e.kits}>{e.kits}</td>
                    <td className="admin-td text-slate-500 whitespace-nowrap">{e.quantity}</td>
                    <td className="admin-td text-slate-400 max-w-xs truncate" title={e.message || ""}>{e.message || "—"}</td>
                    <td className="admin-td text-slate-400 whitespace-nowrap">
                      {new Date(e.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className="admin-td">
                      <EnquiryStatusSelect endpoint={`/api/atl-kits-enquiry/${e.id}`} status={e.status} />
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
