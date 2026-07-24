import { History } from "lucide-react";
import Pagination, { parsePage } from "@/components/admin/Pagination";
import AdminSearchInput from "@/components/admin/AdminSearchInput";
import PageHeader from "@/components/admin/ui/PageHeader";
import Badge from "@/components/admin/ui/Badge";
import { formatDateTime } from "@/utils/formatDateTime";

// New page — no Hardvanta equivalent (Activity Log is a hvkart-admin-only,
// admin-management feature). Read-only list/search/pagination layout follows
// the same conventions as dashboard/users/page.js.
export const dynamic = "force-dynamic";
export const metadata = { title: "Activity Log — Admin" };

const PAGE_SIZE = 30;

const ACTION_TONES = {
  LOGIN: "green",
  LOGOUT: "slate",
  PASSWORD_CHANGE: "amber",
};

function actionTone(action) {
  if (ACTION_TONES[action]) return ACTION_TONES[action];
  if (action.includes("DELETE")) return "red";
  if (action.includes("CREATE")) return "blue";
  if (action.includes("DISABLE")) return "red";
  return "slate";
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
      <PageHeader title="Activity Log" description={`${total} recorded events`} />

      <div className="mb-4">
        <AdminSearchInput placeholder="Search by admin, email or action…" basePath="/dashboard/activity-log" searchParams={searchParams} />
      </div>

      <div className="admin-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-admin-border bg-slate-50/80">
                <th className="admin-th">Admin</th>
                <th className="admin-th">Action</th>
                <th className="admin-th">Details</th>
                <th className="admin-th">When</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-admin-border">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-12 text-center text-slate-500">
                    <History size={32} className="mx-auto mb-2 text-slate-300" />
                    No activity recorded yet
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="admin-row-hover">
                    <td className="admin-td">
                      <p className="font-semibold text-slate-900">{log.userName || "—"}</p>
                      <p className="text-xs text-slate-400">{log.userEmail}</p>
                    </td>
                    <td className="admin-td">
                      <Badge tone={actionTone(log.action)}>{log.action}</Badge>
                    </td>
                    <td className="admin-td max-w-md truncate text-slate-500" title={log.details || ""}>
                      {log.details || "—"}
                    </td>
                    <td className="admin-td whitespace-nowrap text-slate-400">{formatDateTime(log.createdAt)}</td>
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
