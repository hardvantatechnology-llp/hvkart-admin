"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/Toast";

// Copied verbatim from hardvanta/src/components/admin/OrderStatusSelect.jsx.
const STATUSES = ["PENDING", "PROCESSING", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"];

export default function OrderStatusSelect({ id, status }) {
  const router = useRouter();
  const toast = useToast();
  const [value, setValue] = useState(status);
  const [busy, setBusy] = useState(false);

  async function handleChange(e) {
    const next = e.target.value;
    const prev = value;
    setValue(next);
    setBusy(true);
    const res = await fetch(`/api/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    setBusy(false);
    if (res.ok) {
      toast.success(`Order status updated to ${next}.`);
      router.refresh();
    } else {
      setValue(prev); // revert on failure
      toast.error("Could not update status.");
    }
  }

  return (
    <select
      value={value}
      onChange={handleChange}
      disabled={busy}
      aria-label="Order status"
      className="rounded-lg glass-card bg-graphite px-3 py-1.5 text-sm font-semibold text-white outline-none focus:shadow-glow-electric disabled:opacity-50"
    >
      {STATUSES.map((s) => (
        <option key={s} value={s} className="bg-graphite text-white">{s}</option>
      ))}
    </select>
  );
}
