import { Settings } from "lucide-react";
import PageHeader from "@/components/admin/ui/PageHeader";

// Adapted from hardvanta/src/app/admin/settings/page.js — import paths
// updated only (no searchParams, no route remapping needed beyond location).
export const dynamic = "force-dynamic";
export const metadata = { title: "Settings — Admin" };

export default async function SettingsPage() {
  const { prisma } = await import("@/lib/database/prisma");
  const { getDeliverySettings } = await import("@/lib/delivery");
  const { formatPrice } = await import("@/utils/formatPrice");

  const gst = await prisma.gSTDetails.findFirst();
  const delivery = await getDeliverySettings();

  return (
    <div>
      <PageHeader title="Settings" description="Store configuration" />

      <div className="space-y-4">
        {/* GST Details */}
        <div className="admin-card p-6">
          <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-slate-900">
            <Settings size={18} className="text-admin-accent" /> GST Details
          </h2>
          {gst ? (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs font-semibold uppercase text-slate-400">Company</p>
                <p className="mt-0.5 font-semibold text-slate-900">{gst.companyName}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-slate-400">GST Number</p>
                <p className="mt-0.5 font-semibold text-slate-900">{gst.gstNumber}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-slate-400">PAN</p>
                <p className="mt-0.5 font-semibold text-slate-900">{gst.panNumber || "—"}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-slate-400">Email</p>
                <p className="mt-0.5 font-semibold text-slate-900">{gst.email || "—"}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-slate-400">Phone</p>
                <p className="mt-0.5 font-semibold text-slate-900">{gst.phone || "—"}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-slate-400">Address</p>
                <p className="mt-0.5 font-semibold text-slate-900">{gst.address}, {gst.city}, {gst.state} - {gst.pincode}</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-400">No GST details configured yet.</p>
          )}
        </div>

        {/* Store Info */}
        <div className="admin-card p-6">
          <h2 className="mb-4 text-base font-bold text-slate-900">Store Info</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs font-semibold uppercase text-slate-400">Store Name</p>
              <p className="mt-0.5 font-semibold text-slate-900">Hardvanta Technologies </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-slate-400">Support Phone</p>
              <p className="mt-0.5 font-semibold text-slate-900">+91 91705 46395</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-slate-400">Free Shipping Above</p>
              <p className="mt-0.5 font-semibold text-slate-900">{formatPrice(delivery.freeShippingThreshold)}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-slate-400">Shipping Charge</p>
              <p className="mt-0.5 font-semibold text-slate-900">{formatPrice(delivery.deliveryCharge)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
