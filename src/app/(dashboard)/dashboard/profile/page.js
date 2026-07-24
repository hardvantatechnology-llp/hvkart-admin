import { getAdminSession } from "@/lib/auth/session";
import { formatDateTime } from "@/utils/formatDateTime";
import ChangePasswordForm from "@/components/admin/ChangePasswordForm";
import PageHeader from "@/components/admin/ui/PageHeader";
import { changeOwnPassword } from "./actions";

// New page — no Hardvanta equivalent (this is a hvkart-admin-only,
// admin-management feature, built for the internal-only admin panel).
export const dynamic = "force-dynamic";
export const metadata = { title: "Profile — Admin" };

export default async function ProfilePage() {
  const session = await getAdminSession();
  const { prisma } = await import("@/lib/database/prisma");
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });

  return (
    <div>
      <PageHeader title="Profile" description="Your account details" />

      <div className="max-w-xl space-y-4">
        <div className="admin-card p-6">
          <h2 className="mb-4 text-base font-bold text-slate-900">Account Details</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs font-semibold uppercase text-slate-400">Name</p>
              <p className="mt-0.5 font-semibold text-slate-900">{user?.name || "—"}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-slate-400">Email</p>
              <p className="mt-0.5 font-semibold text-slate-900">{user?.email}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-slate-400">Role</p>
              <p className="mt-0.5 font-semibold text-slate-900">{user?.role}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-slate-400">Last Login</p>
              <p className="mt-0.5 font-semibold text-slate-900">
                {user?.lastLoginAt ? formatDateTime(user.lastLoginAt) : "—"}
              </p>
            </div>
          </div>
        </div>

        <div className="admin-card p-6">
          <h2 className="mb-4 text-base font-bold text-slate-900">Change Password</h2>
          <ChangePasswordForm onSubmit={changeOwnPassword} />
        </div>
      </div>
    </div>
  );
}
