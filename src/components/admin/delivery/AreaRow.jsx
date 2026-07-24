"use client";

import { useState, useTransition } from "react";
import AdminDeleteButton from "@/components/admin/AdminDeleteButton";
import Badge from "@/components/admin/ui/Badge";

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
    <tr className="admin-row-hover">
      <td className="admin-td font-semibold text-slate-900">{area.name}</td>
      <td className="admin-td text-slate-500">{area._count.pincodes}</td>
      <td className="admin-td">
        <button
          type="button"
          onClick={handleToggle}
          disabled={pending}
          className="disabled:opacity-50"
        >
          <Badge tone={area.active ? "green" : "red"} dot>{area.active ? "Active" : "Disabled"}</Badge>
        </button>
        {error && <p className="mt-1 text-xs text-admin-danger">{error}</p>}
      </td>
      <td className="admin-td text-right">
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
