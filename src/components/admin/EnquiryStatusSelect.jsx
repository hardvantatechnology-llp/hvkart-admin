"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/Toast";
import { ENQUIRY_STATUSES, ENQUIRY_STATUS_LABELS } from "@/lib/enquiryStatus";

// Copied verbatim from hardvanta/src/components/admin/EnquiryStatusSelect.jsx.
/** Editable status <select> for enquiry admin lists — PATCHes `endpoint` on change. */
export default function EnquiryStatusSelect({ endpoint, status }) {
  const router = useRouter();
  const toast = useToast();
  const [value, setValue] = useState(status);
  const [busy, setBusy] = useState(false);

  async function handleChange(e) {
    const next = e.target.value;
    const prev = value;
    setValue(next);
    setBusy(true);
    const res = await fetch(endpoint, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    setBusy(false);
    if (res.ok) {
      toast.success(`Status updated to ${ENQUIRY_STATUS_LABELS[next]}.`);
      router.refresh();
    } else {
      setValue(prev);
      toast.error("Could not update status.");
    }
  }

  return (
    <select
      value={value}
      onChange={handleChange}
      disabled={busy}
      aria-label="Enquiry status"
      className="admin-select py-1.5 text-sm font-semibold disabled:opacity-50"
    >
      {ENQUIRY_STATUSES.map((s) => (
        <option key={s} value={s}>
          {ENQUIRY_STATUS_LABELS[s]}
        </option>
      ))}
    </select>
  );
}
