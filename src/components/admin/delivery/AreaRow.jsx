"use client";

import { useState, useTransition } from "react";
import AdminDeleteButton from "@/components/admin/AdminDeleteButton";

// Copied verbatim from hardvanta/src/components/admin/delivery/AreaRow.jsx.
export default function AreaRow({ area, onToggleActive, onDelete }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function handleToggle() {
    setError("");
    startTransition(async () => {
      try {
        await onToggleActive(area.id, !area.active);
      } catch (err) {
        setError(err?.message || "Could not update.");
      }
    });
  }

  return (
    <tr className="hover:bg-white/5 transition-colors">
      <td className="px-5 py-3 font-semibold text-white/90">{area.name}</td>
      <td className="px-5 py-3 text-white/60">{area._count.pincodes}</td>
      <td className="px-5 py-3">
        <button
          type="button"
          onClick={handleToggle}
          disabled={pending}
          className={`w-fit rounded-full px-2.5 py-1 text-xs font-semibold transition-colors disabled:opacity-50 ${
            area.active ? "bg-cyan/10 text-cyan hover:bg-cyan/20" : "bg-red-500/10 text-red-400 hover:bg-red-500/20"
          }`}
        >
          {area.active ? "🟢 Active" : "⚪ Disabled"}
        </button>
        {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
      </td>
      <td className="px-5 py-3 text-right">
        <AdminDeleteButton
          onDelete={() => onDelete(area.id)}
          label={area.name}
          disabled={area._count.pincodes > 0}
          disabledTitle="Remove all pincodes in this area first"
        />
      </td>
    </tr>
  );
}
