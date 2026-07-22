import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth/session";
import AdminViewReset from "@/components/admin/AdminViewReset";
import AdminSidebarNav from "@/components/admin/AdminSidebarNav";

// Adapted from hardvanta/src/app/admin/layout.js — same background/gradient
// wrapper, same liquid-blob decoration, same flex container, same sidebar +
// main structure. Only the auth-guard import path and redirect target
// (/dashboard instead of /admin) differ, matching this project's own routes
// established in Phase 1. hardvanta's admin shell has no header/footer/
// breadcrumb/user-menu of its own, so none is added here — see the Phase 2
// migration report.
export const dynamic = "force-dynamic";
export const metadata = { title: "Admin — hardvanta" };

export default async function DashboardLayout({ children }) {
  const session = await getAdminSession();
  if (!session) redirect("/login?callbackUrl=/dashboard");

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-graphite to-obsidian">
      <div className="liquid-blob left-1/4 top-[-15%] h-96 w-96 bg-electric/10" />
      <div className="container-page relative flex flex-col gap-6 py-8 lg:flex-row">
        <AdminViewReset />
        <AdminSidebarNav />
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
