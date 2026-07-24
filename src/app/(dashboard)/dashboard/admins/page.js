import { ShieldCheck, CheckCircle2, XCircle } from "lucide-react";
import Pagination, { parsePage } from "@/components/admin/Pagination";
import AdminSearchInput from "@/components/admin/AdminSearchInput";
import AdminStatCard from "@/components/admin/AdminStatCard";
import AddAdminButton from "@/components/admin/AddAdminButton";
import AdminUserRow from "@/components/admin/AdminUserRow";
import { getAdminSession } from "@/lib/auth/session";
import { createAdmin, updateAdmin, toggleAdminActive, deleteAdmin, resetAdminPassword } from "./actions";

// New page — no Hardvanta equivalent (Admin Users management is a
// hvkart-admin-only, admin-management feature). Search/pagination/stats
// layout follows the same conventions as dashboard/coupons/page.js.
export const dynamic = "force-dynamic";
export const metadata = { title: "Admins — Admin" };

const PAGE_SIZE = 20;

export default async function AdminsPage({ searchParams: searchParamsPromise }) {
  const searchParams = await searchParamsPromise;
  const session = await getAdminSession();
  const { prisma } = await import("@/lib/database/prisma");

  const page = parsePage(searchParams);
  const q = searchParams?.q?.trim() || "";

  const where = {
    role: "ADMIN",
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [admins, total, totalAdmins, activeAdmins, disabledAdmins] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.user.count({ where }),
    prisma.user.count({ where: { role: "ADMIN" } }),
    prisma.user.count({ where: { role: "ADMIN", isActive: true } }),
    prisma.user.count({ where: { role: "ADMIN", isActive: false } }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Admins</h1>
          <p className="text-sm text-white/40 mt-0.5">{totalAdmins} total admin accounts</p>
        </div>
        <AddAdminButton onCreate={createAdmin} />
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <AdminStatCard label="Total Admins" value={totalAdmins} icon={<ShieldCheck size={17} />} glow="electric" />
        <AdminStatCard label="Active" value={activeAdmins} icon={<CheckCircle2 size={17} />} glow="cyan" delay={0.05} />
        <AdminStatCard label="Disabled" value={disabledAdmins} icon={<XCircle size={17} />} glow="red" delay={0.1} />
      </div>

      <div className="mb-4">
        <AdminSearchInput placeholder="Search by name or email…" basePath="/dashboard/admins" searchParams={searchParams} />
      </div>

      <div className="overflow-hidden rounded-2xl glass-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.03] text-left text-xs font-bold uppercase tracking-wider text-white/40">
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">Email</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Last Login</th>
                <th className="px-5 py-3">Created</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {admins.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-white/50">
                    <ShieldCheck size={32} className="mx-auto mb-2 text-white/20" />
                    No admins found
                  </td>
                </tr>
              ) : (
                admins.map((admin) => (
                  <AdminUserRow
                    key={admin.id}
                    admin={admin}
                    currentUserId={session.user.id}
                    onUpdate={updateAdmin}
                    onToggleActive={toggleAdminActive}
                    onDelete={deleteAdmin}
                    onResetPassword={resetAdminPassword}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination page={page} totalPages={totalPages} basePath="/dashboard/admins" searchParams={searchParams} />
    </div>
  );
}
