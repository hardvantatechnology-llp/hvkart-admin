import { Users } from "lucide-react";
import Pagination, { parsePage } from "@/components/admin/Pagination";
import AdminSearchInput from "@/components/admin/AdminSearchInput";

// Adapted from hardvanta/src/app/admin/customers/page.js — searchParams is
// a Promise in Next.js 16 (awaited below), import path updated, and
// AdminSearchInput/Pagination basePath remapped /admin/customers -> /dashboard/customers.
export const dynamic = "force-dynamic";
export const metadata = { title: "Customers — Admin" };

const PAGE_SIZE = 20;

export default async function CustomersPage({ searchParams: searchParamsPromise }) {
  const searchParams = await searchParamsPromise;
  const { prisma } = await import("@/lib/database/prisma");

  const page = parsePage(searchParams);
  const q = searchParams?.q?.trim();
  const where = {
    role: "USER",
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [customers, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        createdAt: true,
        _count: { select: { orders: true } },
      },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.user.count({ where }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Customers</h1>
        <p className="text-sm text-white/40 mt-0.5">{total} total customers</p>
      </div>

      <div className="mb-4">
        <AdminSearchInput placeholder="Search by name or email…" basePath="/dashboard/customers" searchParams={searchParams} />
      </div>

      <div className="overflow-hidden rounded-2xl glass-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.03] text-left text-xs font-bold uppercase tracking-wider text-white/40">
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">Email</th>
                <th className="px-5 py-3">Phone</th>
                <th className="px-5 py-3">Orders</th>
                <th className="px-5 py-3">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {customers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-white/50">
                    <Users size={32} className="mx-auto mb-2 text-white/20" />
                    No customers found
                  </td>
                </tr>
              ) : (
                customers.map((user) => (
                  <tr key={user.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-5 py-3 font-semibold text-white/90">{user.name || "—"}</td>
                    <td className="px-5 py-3 text-white/50">{user.email}</td>
                    <td className="px-5 py-3 text-white/50">{user.phone || "—"}</td>
                    <td className="px-5 py-3">
                      <span className="rounded-full bg-electric/10 px-2.5 py-1 text-xs font-semibold text-electric-light">
                        {user._count.orders} orders
                      </span>
                    </td>
                    <td className="px-5 py-3 text-white/40">
                      {new Date(user.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination page={page} totalPages={totalPages} basePath="/dashboard/customers" searchParams={searchParams} />
    </div>
  );
}
