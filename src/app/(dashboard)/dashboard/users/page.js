import { Users, Shield, User } from "lucide-react";
import Pagination, { parsePage } from "@/components/admin/Pagination";
import AdminStatCard from "@/components/admin/AdminStatCard";

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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Users</h1>
        <p className="text-sm text-white/40 mt-0.5">{total} total users</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <AdminStatCard label="Admins" value={adminCount} icon={<Shield size={17} />} glow="electric" />
        <AdminStatCard label="Customers" value={customerCount} icon={<User size={17} />} glow="cyan" delay={0.05} />
      </div>

      <div className="overflow-hidden rounded-2xl glass-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.03] text-left text-xs font-bold uppercase tracking-wider text-white/40">
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">Email</th>
                <th className="px-5 py-3">Role</th>
                <th className="px-5 py-3">Orders</th>
                <th className="px-5 py-3">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-white/50">
                    <Users size={32} className="mx-auto mb-2 text-white/20" />
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-5 py-3 font-semibold text-white/90">{user.name || "—"}</td>
                    <td className="px-5 py-3 text-white/50">{user.email}</td>
                    <td className="px-5 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        user.role === "ADMIN"
                          ? "bg-electric/10 text-electric-light"
                          : "bg-cyan/10 text-cyan"
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-white/40">{user._count.orders}</td>
                    <td className="px-5 py-3 text-white/40">
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
