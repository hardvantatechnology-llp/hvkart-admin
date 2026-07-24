"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { useToast } from "@/components/ui/Toast";

/**
 * Shared delete-with-confirmation control for admin list rows.
 * `onDelete` performs the actual deletion (fetch call or bound server
 * action) and is responsible for whatever happens after success
 * (redirect, router.refresh(), etc.) — this component only owns the
 * confirm UI, pending state, and error/success toast.
 * Copied verbatim from hardvanta/src/components/admin/AdminDeleteButton.jsx.
 */
export default function AdminDeleteButton({
  onDelete,
  label = "this item",
  iconOnly = true,
  disabled = false,
  disabledTitle,
}) {
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleConfirm() {
    setLoading(true);
    setError("");
    try {
      await onDelete();
      setOpen(false);
      toast.success(`Deleted ${label}.`);
    } catch (err) {
      const message = err?.message || "Could not delete. Please try again.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {iconOnly ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          disabled={disabled}
          className="admin-focus-ring rounded-lg p-1 text-slate-400 transition-colors hover:text-admin-danger disabled:opacity-30 disabled:hover:text-slate-400"
          aria-label={`Delete ${label}`}
          title={disabled ? disabledTitle : `Delete ${label}`}
        >
          <Trash2 size={16} />
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          disabled={disabled}
          className="admin-focus-ring flex items-center gap-1.5 rounded-lg font-semibold text-admin-danger transition-colors hover:text-red-700 disabled:opacity-30 disabled:hover:text-admin-danger"
          title={disabled ? disabledTitle : undefined}
        >
          <Trash2 size={14} /> Delete
        </button>
      )}

      <ConfirmModal
        open={open}
        onClose={() => { setOpen(false); setError(""); }}
        onConfirm={handleConfirm}
        loading={loading}
        error={error}
        title={`Delete ${label}?`}
        description="This cannot be undone."
        confirmLabel="Delete"
      />
    </>
  );
}
