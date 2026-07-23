import { Bell } from "lucide-react";

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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Notifications</h1>
        <p className="text-sm text-white/40 mt-0.5">{notifications.length} total notifications</p>
      </div>

      <div className="overflow-hidden rounded-2xl glass-card">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Bell size={40} className="mb-3 text-white/20" />
            <p className="font-semibold text-white">No notifications</p>
          </div>
        ) : (
          <ul className="divide-y divide-white/10">
            {notifications.map((notif) => (
              <li key={notif.id} className={`flex items-start gap-4 px-5 py-4 ${!notif.isRead ? "bg-electric/5" : ""}`}>
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/5">
                  <Bell size={16} className="text-electric-light" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white/90">{notif.title}</p>
                  <p className="text-sm text-white/50">{notif.message}</p>
                  <p className="mt-1 text-xs text-white/40">
                    {notif.user?.name || "System"} · {new Date(notif.createdAt).toLocaleDateString("en-IN")}
                  </p>
                </div>
                {!notif.isRead && <span className="h-2 w-2 rounded-full bg-gradient-to-r from-electric to-liquid mt-2" />}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
