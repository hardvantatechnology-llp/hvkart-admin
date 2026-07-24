import { getAdminSession } from "@/lib/auth/session";
import { formatDateTime } from "@/utils/formatDateTime";
import ChangePasswordForm from "@/components/admin/ChangePasswordForm";
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Profile</h1>
        <p className="text-sm text-white/40 mt-0.5">Your account details</p>
      </div>

      <div className="space-y-4 max-w-xl">
        <div className="rounded-2xl glass-card p-6">
          <h2 className="text-base font-bold text-white mb-4">Account Details</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-white/40 uppercase font-semibold">Name</p>
              <p className="font-semibold text-white/90 mt-0.5">{user?.name || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-white/40 uppercase font-semibold">Email</p>
              <p className="font-semibold text-white/90 mt-0.5">{user?.email}</p>
            </div>
            <div>
              <p className="text-xs text-white/40 uppercase font-semibold">Role</p>
              <p className="font-semibold text-white/90 mt-0.5">{user?.role}</p>
            </div>
            <div>
              <p className="text-xs text-white/40 uppercase font-semibold">Last Login</p>
              <p className="font-semibold text-white/90 mt-0.5">
                {user?.lastLoginAt ? formatDateTime(user.lastLoginAt) : "—"}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl glass-card p-6">
          <h2 className="text-base font-bold text-white mb-4">Change Password</h2>
          <ChangePasswordForm onSubmit={changeOwnPassword} />
        </div>
      </div>
    </div>
  );
}
