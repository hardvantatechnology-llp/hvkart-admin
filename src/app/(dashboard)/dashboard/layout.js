import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth/session";
import SignOutButton from "@/components/auth/SignOutButton";

export const dynamic = "force-dynamic";
export const metadata = { title: "Dashboard — hardvanta Admin" };

// Defense in depth, same pattern as hardvanta/src/app/admin/layout.js:
// src/proxy.js already gates /dashboard/:path*, this is the second check.
export default async function DashboardLayout({ children }) {
  const session = await getAdminSession();
  if (!session) redirect("/login?callbackUrl=/dashboard");

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="flex items-center justify-between border-b border-zinc-200 bg-white px-6 py-4">
        <span className="text-sm font-semibold text-zinc-900">hardvanta Admin</span>
        <div className="flex items-center gap-4">
          <span className="text-sm text-zinc-500">{session.user.email}</span>
          <SignOutButton />
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-8">{children}</main>
    </div>
  );
}
