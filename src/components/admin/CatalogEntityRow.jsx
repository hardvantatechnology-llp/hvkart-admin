"use client";

import { useState, useTransition } from "react";
import { Pencil, Check, X } from "lucide-react";
import AdminDeleteButton from "./AdminDeleteButton";

/**
 * One editable table row shared by the Categories and Brands admin pages.
 * `onUpdate`, `onToggleActive`, `onDelete` are Server Actions bound to the
 * specific entity (category vs brand) by the parent page.
 * Copied verbatim from hardvanta/src/components/admin/CatalogEntityRow.jsx.
 */
export default function CatalogEntityRow({ item, productCount, onUpdate, onToggleActive, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(item.name);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function saveEdit() {
    setError("");
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Name can't be empty.");
      return;
    }
    const fd = new FormData();
    fd.set("id", item.id);
    fd.set("name", trimmed);
    startTransition(async () => {
      try {
        await onUpdate(fd);
        setEditing(false);
      } catch (err) {
        setError(err?.message || "Could not save.");
      }
    });
  }

  function cancelEdit() {
    setName(item.name);
    setError("");
    setEditing(false);
  }

  function handleToggleActive() {
    setError("");
    startTransition(async () => {
      try {
        await onToggleActive(item.id, !item.active);
      } catch (err) {
        setError(err?.message || "Could not update status.");
      }
    });
  }

  return (
    <tr className="hover:bg-white/5 transition-colors">
      <td className="px-5 py-3 font-semibold text-white/90">
        {editing ? (
          <div className="flex items-center gap-2">
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") saveEdit();
                if (e.key === "Escape") cancelEdit();
              }}
              aria-label={`Rename ${item.name}`}
              className="w-full rounded-lg glass-card px-2 py-1 text-sm text-white outline-none focus:shadow-glow-electric"
              disabled={pending}
            />
            <button
              type="button"
              onClick={saveEdit}
              disabled={pending}
              className="text-cyan hover:text-cyan/80 disabled:opacity-50"
              aria-label="Save"
            >
              <Check size={16} />
            </button>
            <button
              type="button"
              onClick={cancelEdit}
              disabled={pending}
              className="text-white/40 hover:text-red-400 disabled:opacity-50"
              aria-label="Cancel"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          item.name
        )}
        {error && <p className="mt-1 text-xs font-normal text-red-400">{error}</p>}
      </td>
      <td className="px-5 py-3 text-white/40">{item.slug}</td>
      <td className="px-5 py-3 text-white/40">{productCount}</td>
      <td className="px-5 py-3">
        <button
          type="button"
          onClick={handleToggleActive}
          disabled={pending}
          className={`rounded-full px-2.5 py-1 text-xs font-semibold transition-colors disabled:opacity-50 ${
            item.active
              ? "bg-cyan/10 text-cyan hover:bg-cyan/20"
              : "bg-red-500/10 text-red-400 hover:bg-red-500/20"
          }`}
          title="Click to toggle"
        >
          {item.active ? "Active" : "Inactive"}
        </button>
      </td>
      <td className="px-5 py-3">
        <div className="flex items-center justify-end gap-3">
          {!editing && (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="text-white/40 hover:text-electric-light"
              aria-label="Edit"
              title="Edit"
            >
              <Pencil size={16} />
            </button>
          )}
          <AdminDeleteButton
            onDelete={() => onDelete(item.id)}
            label={item.name}
            disabled={pending || productCount > 0}
            disabledTitle={productCount > 0 ? "Cannot delete — still has products" : undefined}
          />
        </div>
      </td>
    </tr>
  );
}
