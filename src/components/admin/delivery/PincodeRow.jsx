"use client";

import { useState, useTransition } from "react";
import { Pencil } from "lucide-react";
import AdminDeleteButton from "@/components/admin/AdminDeleteButton";
import Badge from "@/components/admin/ui/Badge";
import PincodeFormModal from "./PincodeFormModal";

// Copied verbatim from hardvanta/src/components/admin/delivery/PincodeRow.jsx.
export default function PincodeRow({ pincode, areas, onUpdate, onToggleActive, onDelete }) {
  const [editOpen, setEditOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function handleToggle() {
    setError("");
    startTransition(async () => {
      try {
        await onToggleActive(pincode.id, !pincode.active);
      } catch (err) {
        setError(err?.message || "Could not update.");
      }
    });
  }

  return (
    <>
      <tr className="admin-row-hover">
        <td className="admin-td whitespace-nowrap font-semibold text-slate-900">{pincode.code}</td>
        <td className="admin-td text-slate-500">{pincode.areaLabel}</td>
        <td className="admin-td whitespace-nowrap text-slate-500">{pincode.deliveryArea.name}</td>
        <td className="admin-td text-slate-500">{pincode.codAvailable ? "✅" : "—"}</td>
        <td className="admin-td text-slate-500">{pincode.expressAvailable ? "✅" : "—"}</td>
        <td className="admin-td">
          <button
            type="button"
            onClick={handleToggle}
            disabled={pending}
            className="disabled:opacity-50"
          >
            <Badge tone={pincode.active ? "green" : "red"} dot>{pincode.active ? "Active" : "Disabled"}</Badge>
          </button>
          {error && <p className="mt-1 text-xs text-admin-danger">{error}</p>}
        </td>
        <td className="admin-td">
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setEditOpen(true)}
              className="text-slate-400 hover:text-admin-accent"
              aria-label={`Edit ${pincode.code}`}
              title="Edit"
            >
              <Pencil size={16} />
            </button>
            <AdminDeleteButton onDelete={() => onDelete(pincode.id)} label={pincode.code} />
          </div>
        </td>
      </tr>

      <PincodeFormModal open={editOpen} onClose={() => setEditOpen(false)} pincode={pincode} areas={areas} onSave={onUpdate} />
    </>
  );
}
