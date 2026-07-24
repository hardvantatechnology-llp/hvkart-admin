import { Hash } from "lucide-react";
import Pagination, { parsePage } from "@/components/admin/Pagination";
import AdminSearchInput from "@/components/admin/AdminSearchInput";
import PincodeRow from "@/components/admin/delivery/PincodeRow";
import AddPincodeButton from "@/components/admin/delivery/AddPincodeButton";
import PageHeader from "@/components/admin/ui/PageHeader";
import { createPincode, updatePincode, togglePincodeActive, deletePincode } from "../actions";

// Adapted from hardvanta/src/app/admin/delivery/pincodes/page.js —
// searchParams is a Promise in Next.js 16 (awaited below), import paths
// updated, and basePath remapped /admin/delivery/pincodes ->
// /dashboard/delivery/pincodes.
export const dynamic = "force-dynamic";
export const metadata = { title: "Pincodes — Admin" };

const PAGE_SIZE = 20;

export default async function PincodesPage({ searchParams: searchParamsPromise }) {
  const searchParams = await searchParamsPromise;
  const { prisma } = await import("@/lib/database/prisma");

  const page = parsePage(searchParams);
  const q = searchParams?.q?.trim();

  const where = q
    ? {
        OR: [
          { code: { contains: q } },
          { areaLabel: { contains: q, mode: "insensitive" } },
          { deliveryArea: { name: { contains: q, mode: "insensitive" } } },
        ],
      }
    : {};

  const [pincodes, total, areas] = await Promise.all([
    prisma.pincode.findMany({
      where,
      include: { deliveryArea: true },
      orderBy: { code: "asc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.pincode.count({ where }),
    prisma.deliveryArea.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div>
      <PageHeader
        title="Pincodes"
        description={`${total} total pincodes`}
        actions={<AddPincodeButton areas={areas} onCreate={createPincode} />}
      />

      <div className="mb-4">
        <AdminSearchInput placeholder="Search by pincode, locality or city…" basePath="/dashboard/delivery/pincodes" searchParams={searchParams} />
      </div>

      <div className="admin-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-admin-border bg-slate-50/80">
                <th className="admin-th">Pincode</th>
                <th className="admin-th">Locality</th>
                <th className="admin-th">City</th>
                <th className="admin-th">COD</th>
                <th className="admin-th">Express</th>
                <th className="admin-th">Status</th>
                <th className="admin-th text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-admin-border">
              {pincodes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-500">
                    <Hash size={32} className="mx-auto mb-2 text-slate-300" />
                    No pincodes found
                  </td>
                </tr>
              ) : (
                pincodes.map((pincode) => (
                  <PincodeRow
                    key={pincode.id}
                    pincode={pincode}
                    areas={areas}
                    onUpdate={updatePincode}
                    onToggleActive={togglePincodeActive}
                    onDelete={deletePincode}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination page={page} totalPages={totalPages} basePath="/dashboard/delivery/pincodes" searchParams={searchParams} />
    </div>
  );
}
