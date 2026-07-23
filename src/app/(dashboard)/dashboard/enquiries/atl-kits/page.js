import Link from "next/link";
import Pagination, { parsePage } from "@/components/admin/Pagination";
import AdminSearchInput from "@/components/admin/AdminSearchInput";
import ExportButtons from "@/components/admin/ExportButtons";
import EnquiryStatusSelect from "@/components/admin/EnquiryStatusSelect";
import { ENQUIRY_STATUSES, ENQUIRY_STATUS_LABELS } from "@/lib/enquiryStatus";
import { Inbox } from "lucide-react";

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
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">ATL Kits Enquiries ({total})</h1>
          <p className="text-sm text-white/40 mt-0.5">Submissions from the ATL Kits Enquiry page</p>
        </div>
        <ExportButtons params={{ type: "atl" }} />
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <AdminSearchInput
          placeholder="Search by contact, email, or school…"
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
                  <th className="px-5 py-3">School / Company</th>
                  <th className="px-5 py-3">Email</th>
                  <th className="px-5 py-3">Phone</th>
                  <th className="px-5 py-3">Product (Kits)</th>
                  <th className="px-5 py-3">Quantity</th>
                  <th className="px-5 py-3">Message</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {enquiries.map((e) => (
                  <tr key={e.id} className="hover:bg-white/5 transition-colors align-top">
                    <td className="px-5 py-3 font-semibold text-white/90 whitespace-nowrap">{e.contactPerson}</td>
                    <td className="px-5 py-3 text-white/60 whitespace-nowrap">{e.schoolName}</td>
                    <td className="px-5 py-3 text-white/60 whitespace-nowrap">{e.email}</td>
                    <td className="px-5 py-3 text-white/60 whitespace-nowrap">{e.phone}</td>
                    <td className="px-5 py-3 text-white/60 max-w-xs truncate" title={e.kits}>{e.kits}</td>
                    <td className="px-5 py-3 text-white/60 whitespace-nowrap">{e.quantity}</td>
                    <td className="px-5 py-3 text-white/40 max-w-xs truncate" title={e.message || ""}>{e.message || "—"}</td>
                    <td className="px-5 py-3 text-white/40 whitespace-nowrap">
                      {new Date(e.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-5 py-3">
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
