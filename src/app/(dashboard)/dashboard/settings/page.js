import { Settings } from "lucide-react";

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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-sm text-white/40 mt-0.5">Store configuration</p>
      </div>

      <div className="space-y-4">
        {/* GST Details */}
        <div className="rounded-2xl glass-card p-6">
          <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <Settings size={18} className="text-electric-light" /> GST Details
          </h2>
          {gst ? (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-white/40 uppercase font-semibold">Company</p>
                <p className="font-semibold text-white/90 mt-0.5">{gst.companyName}</p>
              </div>
              <div>
                <p className="text-xs text-white/40 uppercase font-semibold">GST Number</p>
                <p className="font-semibold text-white/90 mt-0.5">{gst.gstNumber}</p>
              </div>
              <div>
                <p className="text-xs text-white/40 uppercase font-semibold">PAN</p>
                <p className="font-semibold text-white/90 mt-0.5">{gst.panNumber || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-white/40 uppercase font-semibold">Email</p>
                <p className="font-semibold text-white/90 mt-0.5">{gst.email || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-white/40 uppercase font-semibold">Phone</p>
                <p className="font-semibold text-white/90 mt-0.5">{gst.phone || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-white/40 uppercase font-semibold">Address</p>
                <p className="font-semibold text-white/90 mt-0.5">{gst.address}, {gst.city}, {gst.state} - {gst.pincode}</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-white/40">No GST details configured yet.</p>
          )}
        </div>

        {/* Store Info */}
        <div className="rounded-2xl glass-card p-6">
          <h2 className="text-base font-bold text-white mb-4">Store Info</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-white/40 uppercase font-semibold">Store Name</p>
              <p className="font-semibold text-white/90 mt-0.5">Hardvanta Technologies </p>
            </div>
            <div>
              <p className="text-xs text-white/40 uppercase font-semibold">Support Phone</p>
              <p className="font-semibold text-white/90 mt-0.5">+91 91705 46395</p>
            </div>
            <div>
              <p className="text-xs text-white/40 uppercase font-semibold">Free Shipping Above</p>
              <p className="font-semibold text-white/90 mt-0.5">{formatPrice(delivery.freeShippingThreshold)}</p>
            </div>
            <div>
              <p className="text-xs text-white/40 uppercase font-semibold">Shipping Charge</p>
              <p className="font-semibold text-white/90 mt-0.5">{formatPrice(delivery.deliveryCharge)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
