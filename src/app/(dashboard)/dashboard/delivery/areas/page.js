import { MapPin } from "lucide-react";
import AreaRow from "@/components/admin/delivery/AreaRow";
import AddAreaButton from "@/components/admin/delivery/AddAreaButton";
import { createDeliveryArea, toggleDeliveryAreaActive, deleteDeliveryArea } from "../actions";

// Copied verbatim from hardvanta/src/app/admin/delivery/areas/page.js — only
// the import path for prisma changed.
export const dynamic = "force-dynamic";
export const metadata = { title: "Delivery Areas — Admin" };

export default async function DeliveryAreasPage() {
  const { prisma } = await import("@/lib/database/prisma");

  const areas = await prisma.deliveryArea.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: { _count: { select: { pincodes: true } } },
  });

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Delivery Areas</h1>
          <p className="text-sm text-white/40 mt-0.5">Cities where delivery is supported (currently Delhi NCR only)</p>
        </div>
        <AddAreaButton onCreate={createDeliveryArea} />
      </div>

      <div className="overflow-hidden rounded-2xl glass-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.03] text-left text-xs font-bold uppercase tracking-wider text-white/40">
                <th className="px-5 py-3">City</th>
                <th className="px-5 py-3">Pincodes</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {areas.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-12 text-center text-white/50">
                    <MapPin size={32} className="mx-auto mb-2 text-white/20" />
                    No delivery areas yet
                  </td>
                </tr>
              ) : (
                areas.map((area) => (
                  <AreaRow
                    key={area.id}
                    area={area}
                    onToggleActive={toggleDeliveryAreaActive}
                    onDelete={deleteDeliveryArea}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
