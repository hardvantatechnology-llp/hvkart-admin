import AdminStatCard from "@/components/admin/AdminStatCard";
import ExportButtons from "@/components/admin/ExportButtons";
import { ENQUIRY_STATUS_LABELS } from "@/lib/enquiryStatus";
import {
  Inbox,
  CalendarDays,
  CalendarRange,
  Calendar,
  Sparkles,
  PhoneCall,
  Clock3,
} from "lucide-react";
import { startOfToday, startOfWeek, startOfMonth } from "@/lib/dateRanges";

// Adapted from hardvanta/src/app/admin/enquiries/report/page.js — import
// path updated only (no searchParams used by this page).
export const dynamic = "force-dynamic";
export const metadata = { title: "Enquiry Report — Admin" };

const PENDING_STATUSES = ["NEW", "CONTACTED", "QUOTATION_SENT"];

export default async function EnquiryReportPage() {
  const { prisma } = await import("@/lib/database/prisma");

  const today = startOfToday();
  const week = startOfWeek();
  const month = startOfMonth();

  const [
    bulkTotal,
    atlTotal,
    bulkToday,
    atlToday,
    bulkWeek,
    atlWeek,
    bulkMonth,
    atlMonth,
    bulkNew,
    atlNew,
    bulkContacted,
    atlContacted,
    bulkPending,
    atlPending,
    b2bTotal,
    bulkEnquiryTotal,
    recentBulk,
    recentAtl,
  ] = await Promise.all([
    prisma.bulkEnquiry.count(),
    prisma.atlKitsEnquiry.count(),
    prisma.bulkEnquiry.count({ where: { createdAt: { gte: today } } }),
    prisma.atlKitsEnquiry.count({ where: { createdAt: { gte: today } } }),
    prisma.bulkEnquiry.count({ where: { createdAt: { gte: week } } }),
    prisma.atlKitsEnquiry.count({ where: { createdAt: { gte: week } } }),
    prisma.bulkEnquiry.count({ where: { createdAt: { gte: month } } }),
    prisma.atlKitsEnquiry.count({ where: { createdAt: { gte: month } } }),
    prisma.bulkEnquiry.count({ where: { status: "NEW" } }),
    prisma.atlKitsEnquiry.count({ where: { status: "NEW" } }),
    prisma.bulkEnquiry.count({ where: { status: "CONTACTED" } }),
    prisma.atlKitsEnquiry.count({ where: { status: "CONTACTED" } }),
    prisma.bulkEnquiry.count({ where: { status: { in: PENDING_STATUSES } } }),
    prisma.atlKitsEnquiry.count({ where: { status: { in: PENDING_STATUSES } } }),
    prisma.bulkEnquiry.count({ where: { enquiryType: "B2B / Bulk" } }),
    prisma.bulkEnquiry.count({ where: { NOT: { enquiryType: "B2B / Bulk" } } }),
    prisma.bulkEnquiry.findMany({ orderBy: { createdAt: "desc" }, take: 10 }),
    prisma.atlKitsEnquiry.findMany({ orderBy: { createdAt: "desc" }, take: 10 }),
  ]);

  const recent = [
    ...recentBulk.map((e) => ({
      id: e.id,
      name: e.name,
      company: e.organization || "—",
      source: e.enquiryType === "B2B / Bulk" ? "B2B / Bulk Order" : "Bulk Enquiry",
      status: e.status,
      createdAt: e.createdAt,
    })),
    ...recentAtl.map((e) => ({
      id: e.id,
      name: e.contactPerson,
      company: e.schoolName,
      source: "ATL Kits Enquiry",
      status: e.status,
      createdAt: e.createdAt,
    })),
  ]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 10);

  const stats = [
    { label: "Total Enquiries", value: bulkTotal + atlTotal, icon: <Inbox size={17} />, glow: "electric" },
    { label: "Today", value: bulkToday + atlToday, icon: <CalendarDays size={17} />, glow: "cyan" },
    { label: "This Week", value: bulkWeek + atlWeek, icon: <CalendarRange size={17} />, glow: "purple" },
    { label: "This Month", value: bulkMonth + atlMonth, icon: <Calendar size={17} />, glow: "electric" },
    { label: "New", value: bulkNew + atlNew, icon: <Sparkles size={17} />, glow: "cyan" },
    { label: "Contacted", value: bulkContacted + atlContacted, icon: <PhoneCall size={17} />, glow: "amber" },
    { label: "Pending", value: bulkPending + atlPending, icon: <Clock3 size={17} />, glow: "red" },
  ];

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Enquiry Report</h1>
          <p className="text-sm text-white/40 mt-0.5">
            Combined stats across B2B / Bulk Orders, Bulk Enquiries, and ATL Kits Enquiries
          </p>
        </div>
        <ExportButtons params={{ type: "all" }} />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6 lg:grid-cols-4">
        {stats.map((s, i) => (
          <AdminStatCard key={s.label} label={s.label} value={s.value} icon={s.icon} glow={s.glow} delay={i * 0.03} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 mb-6 sm:grid-cols-3">
        <div className="glass-card rounded-2xl p-5">
          <p className="text-sm text-white/50">B2B / Bulk Orders</p>
          <p className="mt-2 text-2xl font-bold text-white">{b2bTotal}</p>
        </div>
        <div className="glass-card rounded-2xl p-5">
          <p className="text-sm text-white/50">Bulk Enquiries</p>
          <p className="mt-2 text-2xl font-bold text-white">{bulkEnquiryTotal}</p>
        </div>
        <div className="glass-card rounded-2xl p-5">
          <p className="text-sm text-white/50">ATL Kits Enquiries</p>
          <p className="mt-2 text-2xl font-bold text-white">{atlTotal}</p>
        </div>
      </div>

      <div className="glass-strong rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-white/10">
          <p className="text-xs font-bold uppercase tracking-wider text-electric-light">Most Recent Enquiries</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left text-xs font-bold uppercase tracking-wider text-white/40">
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">Company</th>
                <th className="px-5 py-3">Source</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {recent.map((r) => (
                <tr key={`${r.source}-${r.id}`} className="hover:bg-white/5 transition-colors">
                  <td className="px-5 py-3 font-semibold text-white/90">{r.name}</td>
                  <td className="px-5 py-3 text-white/60">{r.company}</td>
                  <td className="px-5 py-3 text-white/40">{r.source}</td>
                  <td className="px-5 py-3 text-white/60">{ENQUIRY_STATUS_LABELS[r.status] || r.status}</td>
                  <td className="px-5 py-3 text-white/40">
                    {new Date(r.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                </tr>
              ))}
              {recent.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-white/40">No enquiries yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
