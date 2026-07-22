import { Hash } from "lucide-react";
import Pagination, { parsePage } from "@/components/admin/Pagination";
import AdminSearchInput from "@/components/admin/AdminSearchInput";
import PincodeRow from "@/components/admin/delivery/PincodeRow";
import AddPincodeButton from "@/components/admin/delivery/AddPincodeButton";
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
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Pincodes</h1>
          <p className="text-sm text-white/40 mt-0.5">{total} total pincodes</p>
        </div>
        <AddPincodeButton areas={areas} onCreate={createPincode} />
      </div>

      <div className="mb-4">
        <AdminSearchInput placeholder="Search by pincode, locality or city…" basePath="/dashboard/delivery/pincodes" searchParams={searchParams} />
      </div>

      <div className="overflow-hidden rounded-2xl glass-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.03] text-left text-xs font-bold uppercase tracking-wider text-white/40">
                <th className="px-5 py-3">Pincode</th>
                <th className="px-5 py-3">Locality</th>
                <th className="px-5 py-3">City</th>
                <th className="px-5 py-3">COD</th>
                <th className="px-5 py-3">Express</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {pincodes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-white/50">
                    <Hash size={32} className="mx-auto mb-2 text-white/20" />
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
