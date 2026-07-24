import { History } from "lucide-react";
import Pagination, { parsePage } from "@/components/admin/Pagination";
import AdminSearchInput from "@/components/admin/AdminSearchInput";
import { formatDateTime } from "@/utils/formatDateTime";

// New page — no Hardvanta equivalent (Activity Log is a hvkart-admin-only,
// admin-management feature). Read-only list/search/pagination layout follows
// the same conventions as dashboard/users/page.js.
export const dynamic = "force-dynamic";
export const metadata = { title: "Activity Log — Admin" };

const PAGE_SIZE = 30;

const ACTION_STYLES = {
  LOGIN: "bg-cyan/10 text-cyan",
  LOGOUT: "bg-white/10 text-white/60",
  PASSWORD_CHANGE: "bg-amber-500/10 text-amber-300",
};

function actionStyle(action) {
  if (ACTION_STYLES[action]) return ACTION_STYLES[action];
  if (action.includes("DELETE")) return "bg-red-500/10 text-red-400";
  if (action.includes("CREATE")) return "bg-electric/10 text-electric-light";
  if (action.includes("DISABLE")) return "bg-red-500/10 text-red-400";
  return "bg-white/10 text-white/60";
}

export default async function ActivityLogPage({ searchParams: searchParamsPromise }) {
  const searchParams = await searchParamsPromise;
  const { prisma } = await import("@/lib/database/prisma");

  const page = parsePage(searchParams);
  const q = searchParams?.q?.trim() || "";

  const where = q
    ? {
        OR: [
          { userEmail: { contains: q, mode: "insensitive" } },
          { userName: { contains: q, mode: "insensitive" } },
          { action: { contains: q, mode: "insensitive" } },
        ],
      }
    : {};

  const [logs, total] = await Promise.all([
    prisma.adminActivityLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.adminActivityLog.count({ where }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Activity Log</h1>
        <p className="text-sm text-white/40 mt-0.5">{total} recorded events</p>
      </div>

      <div className="mb-4">
        <AdminSearchInput placeholder="Search by admin, email or action…" basePath="/dashboard/activity-log" searchParams={searchParams} />
      </div>

      <div className="overflow-hidden rounded-2xl glass-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.03] text-left text-xs font-bold uppercase tracking-wider text-white/40">
                <th className="px-5 py-3">Admin</th>
                <th className="px-5 py-3">Action</th>
                <th className="px-5 py-3">Details</th>
                <th className="px-5 py-3">When</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-12 text-center text-white/50">
                    <History size={32} className="mx-auto mb-2 text-white/20" />
                    No activity recorded yet
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-5 py-3">
                      <p className="font-semibold text-white/90">{log.userName || "—"}</p>
                      <p className="text-xs text-white/40">{log.userEmail}</p>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${actionStyle(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-white/50 max-w-md truncate" title={log.details || ""}>
                      {log.details || "—"}
                    </td>
                    <td className="px-5 py-3 text-white/40 whitespace-nowrap">{formatDateTime(log.createdAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination page={page} totalPages={totalPages} basePath="/dashboard/activity-log" searchParams={searchParams} />
    </div>
  );
}
