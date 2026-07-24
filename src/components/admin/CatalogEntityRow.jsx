"use client";

import { useState, useTransition } from "react";
import { Pencil, Check, X } from "lucide-react";
import AdminDeleteButton from "./AdminDeleteButton";
import Badge from "./ui/Badge";

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
    <tr className="admin-row-hover">
      <td className="admin-td font-semibold text-slate-900">
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
              className="admin-input w-full py-1"
              disabled={pending}
            />
            <button
              type="button"
              onClick={saveEdit}
              disabled={pending}
              className="text-admin-success hover:text-green-700 disabled:opacity-50"
              aria-label="Save"
            >
              <Check size={16} />
            </button>
            <button
              type="button"
              onClick={cancelEdit}
              disabled={pending}
              className="text-slate-400 hover:text-admin-danger disabled:opacity-50"
              aria-label="Cancel"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          item.name
        )}
        {error && <p className="mt-1 text-xs font-normal text-admin-danger">{error}</p>}
      </td>
      <td className="admin-td text-slate-400">{item.slug}</td>
      <td className="admin-td text-slate-500">{productCount}</td>
      <td className="admin-td">
        <button
          type="button"
          onClick={handleToggleActive}
          disabled={pending}
          className="disabled:opacity-50"
          title="Click to toggle"
        >
          <Badge tone={item.active ? "green" : "red"} dot>{item.active ? "Active" : "Inactive"}</Badge>
        </button>
      </td>
      <td className="admin-td">
        <div className="flex items-center justify-end gap-3">
          {!editing && (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="text-slate-400 hover:text-admin-accent"
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
