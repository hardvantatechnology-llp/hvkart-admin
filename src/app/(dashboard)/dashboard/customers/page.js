import { Users } from "lucide-react";
import Pagination, { parsePage } from "@/components/admin/Pagination";
import AdminSearchInput from "@/components/admin/AdminSearchInput";
import PageHeader from "@/components/admin/ui/PageHeader";
import Badge from "@/components/admin/ui/Badge";

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
      <PageHeader title="Customers" description={`${total} total customers`} />

      <div className="mb-4">
        <AdminSearchInput placeholder="Search by name or email…" basePath="/dashboard/customers" searchParams={searchParams} />
      </div>

      <div className="admin-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-admin-border bg-slate-50/80">
                <th className="admin-th">Name</th>
                <th className="admin-th">Email</th>
                <th className="admin-th">Phone</th>
                <th className="admin-th">Orders</th>
                <th className="admin-th">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-admin-border">
              {customers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-slate-500">
                    <Users size={32} className="mx-auto mb-2 text-slate-300" />
                    No customers found
                  </td>
                </tr>
              ) : (
                customers.map((user) => (
                  <tr key={user.id} className="admin-row-hover">
                    <td className="admin-td font-semibold text-slate-900">{user.name || "—"}</td>
                    <td className="admin-td text-slate-500">{user.email}</td>
                    <td className="admin-td text-slate-500">{user.phone || "—"}</td>
                    <td className="admin-td">
                      <Badge tone="blue">{user._count.orders} orders</Badge>
                    </td>
                    <td className="admin-td text-slate-400">
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
