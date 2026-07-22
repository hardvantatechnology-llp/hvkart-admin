import DeliverySettingsForm from "@/components/admin/delivery/DeliverySettingsForm";
import { getDeliverySettings } from "@/lib/delivery";
import { updateDeliverySettings } from "../actions";

// Copied verbatim from hardvanta/src/app/admin/delivery/settings/page.js — no changes needed.
export const dynamic = "force-dynamic";
export const metadata = { title: "Delivery Settings — Admin" };

export default async function DeliverySettingsPage() {
  const settings = await getDeliverySettings();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Delivery Settings</h1>
        <p className="text-sm text-white/40 mt-0.5">Cutoff time, transit days and display-only shipping figures</p>
      </div>
      <DeliverySettingsForm settings={settings} onSave={updateDeliverySettings} />
    </div>
  );
}
