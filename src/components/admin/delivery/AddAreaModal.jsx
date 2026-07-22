"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
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
    <div className="fixed inset-0 z-[250] flex items-center justify-center bg-obsidian/70 backdrop-blur-md px-4">
      <div className="glass-strong w-full max-w-sm rounded-3xl p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Add Delivery Area</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="text-white/50 hover:text-white">
            <X size={18} />
          </button>
        </div>
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-3">
          <input
            name="name"
            required
            placeholder="City name, e.g. Noida"
            className="w-full rounded-lg glass-card px-3 py-2.5 text-sm text-white outline-none focus:shadow-glow-electric placeholder:text-white/30"
          />
          {error && <p className="text-sm text-red-400">{error}</p>}
          <Button type="submit" variant="gradient" className="w-full justify-center" disabled={pending}>
            {pending ? "Saving…" : "Add City"}
          </Button>
        </form>
      </div>
    </div>,
    document.body
  );
}
