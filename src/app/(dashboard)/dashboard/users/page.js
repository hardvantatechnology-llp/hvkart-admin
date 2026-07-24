import { Users, Shield, User } from "lucide-react";
import Pagination, { parsePage } from "@/components/admin/Pagination";
import AdminStatCard from "@/components/admin/AdminStatCard";
import PageHeader from "@/components/admin/ui/PageHeader";
import Badge from "@/components/admin/ui/Badge";

// Adapted from hardvanta/src/app/admin/users/page.js — searchParams is
// a Promise in Next.js 16 (awaited below), import path updated, and
// Pagination's basePath remapped /admin/users -> /dashboard/users.
export const dynamic = "force-dynamic";
export const metadata = { title: "Users — Admin" };

const PAGE_SIZE = 20;

export default async function UsersPage({ searchParams: searchParamsPromise }) {
  const searchParams = await searchParamsPromise;
  const { prisma } = await import("@/lib/database/prisma");

  const page = parsePage(searchParams);
  const [users, total, adminCount, customerCount] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        _count: { select: { orders: true } },
      },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.user.count(),
    prisma.user.count({ where: { role: "ADMIN" } }),
    prisma.user.count({ where: { role: "USER" } }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div>
      <PageHeader title="Users" description={`${total} total users`} />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <AdminStatCard label="Admins" value={adminCount} icon={<Shield size={17} />} glow="electric" />
        <AdminStatCard label="Customers" value={customerCount} icon={<User size={17} />} glow="cyan" delay={0.05} />
      </div>

      <div className="admin-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-admin-border bg-slate-50/80">
                <th className="admin-th">Name</th>
                <th className="admin-th">Email</th>
                <th className="admin-th">Role</th>
                <th className="admin-th">Orders</th>
                <th className="admin-th">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-admin-border">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-slate-500">
                    <Users size={32} className="mx-auto mb-2 text-slate-300" />
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="admin-row-hover">
                    <td className="admin-td font-semibold text-slate-900">{user.name || "—"}</td>
                    <td className="admin-td text-slate-500">{user.email}</td>
                    <td className="admin-td">
                      <Badge tone={user.role === "ADMIN" ? "blue" : "green"}>{user.role}</Badge>
                    </td>
                    <td className="admin-td text-slate-400">{user._count.orders}</td>
                    <td className="admin-td text-slate-400">
                      {new Date(user.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric", month: "short", year: "numeric",
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination page={page} totalPages={totalPages} basePath="/dashboard/users" />
    </div>
  );
}
