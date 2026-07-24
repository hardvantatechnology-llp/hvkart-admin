import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth/session";
import AdminViewReset from "@/components/admin/AdminViewReset";
import AdminSidebarNav from "@/components/admin/AdminSidebarNav";
import { AdminShellProvider } from "@/components/admin/AdminShellProvider";
import AdminHeader from "@/components/layout/AdminHeader";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin — hardvanta" };

export default async function DashboardLayout({ children }) {
  const session = await getAdminSession();
  if (!session) redirect("/login?callbackUrl=/dashboard");

  const { prisma } = await import("@/lib/database/prisma");
  const unreadCount = await prisma.notification.count({ where: { isRead: false } });

  return (
    <div className="admin-shell min-h-screen">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row lg:px-8">
        <AdminShellProvider>
          <AdminViewReset />
          <AdminSidebarNav />
          <main className="min-w-0 flex-1">
            <AdminHeader user={session.user} unreadCount={unreadCount} />
            {children}
          </main>
        </AdminShellProvider>
      </div>
    </div>
  );
}
