"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { MapPin, X } from "lucide-react";
import Button from "@/components/ui/Button";

// Adapted from hardvanta/src/components/admin/delivery/AddAreaModal.jsx.
// eslint-config-next 16's newer react-hooks/set-state-in-effect rule flags
// the two setState-in-effect patterns hardvanta uses here (same issue seen
// in Products' ConfirmModal/Toast and Coupons' CouponFormModal) — fixed with
// the same established pattern: an eslint-disable-next-line for the SSR-safe
// mount flag, and React's "adjust state during render" pattern for the
// reset-on-open logic. No behavior change.
export default function AddAreaModal({ open, onClose, onSave }) {
  const [mounted, setMounted] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const formRef = useRef(null);
  const [prevOpen, setPrevOpen] = useState(open);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) setError("");
  }

  function handleSubmit(e) {
    e.preventDefault();
    setError("");
    const formData = new FormData(formRef.current);
    startTransition(async () => {
      try {
        await onSave(formData);
        onClose();
      } catch (err) {
        setError(err?.message || "Could not save.");
      }
    });
  }

  if (!mounted || !open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[250] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4">
      <div className="admin-shell w-full max-w-sm rounded-2xl border border-admin-border bg-white p-6 shadow-admin-popover">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
            <MapPin size={18} className="text-admin-accent" />
            Add Delivery Area
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="admin-focus-ring rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-900"
          >
            <X size={18} />
          </button>
        </div>
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-3">
          <input
            name="name"
            required
            placeholder="City name, e.g. Noida"
            className="admin-input"
          />
          {error && <p className="text-sm font-medium text-admin-danger">{error}</p>}
          <Button type="submit" variant="enterprise-primary" loading={pending} className="w-full justify-center">
            {pending ? "Saving…" : "Add City"}
          </Button>
        </form>
      </div>
    </div>,
    document.body
  );
}
