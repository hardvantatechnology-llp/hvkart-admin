import DeliverySettingsForm from "@/components/admin/delivery/DeliverySettingsForm";
import PageHeader from "@/components/admin/ui/PageHeader";
import { getDeliverySettings } from "@/lib/delivery";
import { updateDeliverySettings } from "../actions";

// Copied verbatim from hardvanta/src/app/admin/delivery/settings/page.js — no changes needed.
export const dynamic = "force-dynamic";
export const metadata = { title: "Delivery Settings — Admin" };

export default async function DeliverySettingsPage() {
  const settings = await getDeliverySettings();

  return (
    <div>
      <PageHeader
        title="Delivery Settings"
        description="Cutoff time, transit days and display-only shipping figures"
      />
      <DeliverySettingsForm settings={settings} onSave={updateDeliverySettings} />
    </div>
  );
}
