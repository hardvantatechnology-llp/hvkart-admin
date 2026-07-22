"use client";

import { useState, useTransition } from "react";
import { Pencil } from "lucide-react";
import AdminDeleteButton from "@/components/admin/AdminDeleteButton";
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
      <tr className="hover:bg-white/5 transition-colors">
        <td className="px-5 py-3 font-semibold text-white/90 whitespace-nowrap">{pincode.code}</td>
        <td className="px-5 py-3 text-white/60">{pincode.areaLabel}</td>
        <td className="px-5 py-3 text-white/60 whitespace-nowrap">{pincode.deliveryArea.name}</td>
        <td className="px-5 py-3 text-white/60">{pincode.codAvailable ? "✅" : "—"}</td>
        <td className="px-5 py-3 text-white/60">{pincode.expressAvailable ? "✅" : "—"}</td>
        <td className="px-5 py-3">
          <button
            type="button"
            onClick={handleToggle}
            disabled={pending}
            className={`w-fit rounded-full px-2.5 py-1 text-xs font-semibold transition-colors disabled:opacity-50 ${
              pincode.active ? "bg-cyan/10 text-cyan hover:bg-cyan/20" : "bg-red-500/10 text-red-400 hover:bg-red-500/20"
            }`}
          >
            {pincode.active ? "🟢 Active" : "⚪ Disabled"}
          </button>
          {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
        </td>
        <td className="px-5 py-3">
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setEditOpen(true)}
              className="text-white/40 hover:text-electric-light"
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
