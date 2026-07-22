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
          className="text-white/40 hover:text-red-400 transition-colors disabled:opacity-30 disabled:hover:text-white/40"
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
          className="flex items-center gap-1.5 font-semibold text-red-400 hover:text-red-300 transition-colors disabled:opacity-30 disabled:hover:text-red-400"
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
