import { MapPin } from "lucide-react";
import AreaRow from "@/components/admin/delivery/AreaRow";
import AddAreaButton from "@/components/admin/delivery/AddAreaButton";
import PageHeader from "@/components/admin/ui/PageHeader";
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
      <PageHeader
        title="Delivery Areas"
        description="Cities where delivery is supported (currently Delhi NCR only)"
        actions={<AddAreaButton onCreate={createDeliveryArea} />}
      />

      <div className="admin-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-admin-border bg-slate-50/80">
                <th className="admin-th">City</th>
                <th className="admin-th">Pincodes</th>
                <th className="admin-th">Status</th>
                <th className="admin-th text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-admin-border">
              {areas.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-12 text-center text-slate-500">
                    <MapPin size={32} className="mx-auto mb-2 text-slate-300" />
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
