"use client";

import { useRef, useTransition } from "react";
import Button from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

// Copied verbatim from hardvanta/src/components/admin/delivery/DeliverySettingsForm.jsx.
export default function DeliverySettingsForm({ settings, onSave }) {
  const toast = useToast();
  const [pending, startTransition] = useTransition();
  const formRef = useRef(null);

  function handleSubmit(e) {
    e.preventDefault();
    const formData = new FormData(formRef.current);
    startTransition(async () => {
      try {
        await onSave(formData);
        toast.success("Delivery settings saved.");
      } catch (err) {
        toast.error(err?.message || "Could not save settings.");
      }
    });
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="admin-card max-w-lg space-y-5 p-6">
      <div>
        <label className="admin-label">Order cutoff time</label>
        <input
          type="time"
          name="cutoffTime"
          defaultValue={settings.cutoffTime}
          className="admin-input"
        />
        <p className="mt-1 text-xs text-slate-400">Orders placed before this time (IST) deliver the next day; after, one day later.</p>
      </div>

      <div>
        <label className="admin-label">Extra standard transit days</label>
        <input
          type="number"
          name="standardDeliveryDaysToAdd"
          min={0}
          defaultValue={settings.standardDeliveryDaysToAdd}
          className="admin-input"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="admin-label">Free shipping threshold (₹)</label>
          <input
            type="number"
            name="freeShippingThreshold"
            min={0}
            defaultValue={settings.freeShippingThreshold}
            className="admin-input"
          />
        </div>
        <div>
          <label className="admin-label">Delivery charge (₹)</label>
          <input
            type="number"
            name="deliveryCharge"
            min={0}
            defaultValue={settings.deliveryCharge}
            className="admin-input"
          />
        </div>
      </div>
      <p className="text-xs text-slate-400">
        Display-only — shown on the delivery info card and cart page. Real checkout shipping cost is unaffected by these two fields.
      </p>

      <div className="flex gap-6 text-sm text-slate-700">
        <label className="flex items-center gap-2">
          <input type="checkbox" name="codEnabled" defaultChecked={settings.codEnabled} className="admin-checkbox" />
          Cash on Delivery enabled
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" name="expressEnabled" defaultChecked={settings.expressEnabled} className="admin-checkbox" />
          Express Delivery enabled
        </label>
      </div>

      <Button type="submit" variant="enterprise-primary" loading={pending}>
        {pending ? "Saving…" : "Save Settings"}
      </Button>
    </form>
  );
}
