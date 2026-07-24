import { Bell } from "lucide-react";
import PageHeader from "@/components/admin/ui/PageHeader";

// Copied verbatim from hardvanta/src/app/admin/notifications/page.js — only
// the import path for prisma changed. Read-only page: no actions.js, no API
// route, no mark-as-read mutation, no pagination (hardcoded take: 100) — all
// matching the source exactly.
export const dynamic = "force-dynamic";
export const metadata = { title: "Notifications — Admin" };

export default async function NotificationsPage() {
  const { prisma } = await import("@/lib/database/prisma");

  const notifications = await prisma.notification.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      title: true,
      message: true,
      isRead: true,
      createdAt: true,
      user: { select: { name: true } },
    },
  });

  return (
    <div>
      <PageHeader title="Notifications" description={`${notifications.length} total notifications`} />

      <div className="admin-card overflow-hidden">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Bell size={40} className="mb-3 text-slate-300" />
            <p className="font-semibold text-slate-900">No notifications</p>
          </div>
        ) : (
          <ul className="divide-y divide-admin-border">
            {notifications.map((notif) => (
              <li key={notif.id} className={`flex items-start gap-4 px-5 py-4 ${!notif.isRead ? "bg-blue-50/50" : ""}`}>
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100">
                  <Bell size={16} className="text-admin-accent" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-900">{notif.title}</p>
                  <p className="text-sm text-slate-500">{notif.message}</p>
                  <p className="mt-1 text-xs text-slate-400">
                    {notif.user?.name || "System"} · {new Date(notif.createdAt).toLocaleDateString("en-IN")}
                  </p>
                </div>
                {!notif.isRead && <span className="h-2 w-2 rounded-full bg-admin-accent mt-2" />}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
