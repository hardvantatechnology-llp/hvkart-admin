"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import Button from "@/components/ui/Button";

// Adapted from hardvanta/src/components/admin/delivery/AddHolidayModal.jsx.
// Same react-hooks/set-state-in-effect fix as AddAreaModal.jsx — see that
// file's comment for rationale. No behavior change.
export default function AddHolidayModal({ open, onClose, onSave }) {
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
          <h2 className="text-lg font-bold text-white">Add Holiday</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="text-white/50 hover:text-white">
            <X size={18} />
          </button>
        </div>
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-semibold text-white/50">Date</label>
            <input
              type="date"
              name="date"
              required
              className="w-full rounded-lg glass-card px-3 py-2.5 text-sm text-white outline-none focus:shadow-glow-electric"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-white/50">Reason (optional)</label>
            <input
              name="reason"
              placeholder="e.g. Diwali"
              className="w-full rounded-lg glass-card px-3 py-2.5 text-sm text-white outline-none focus:shadow-glow-electric placeholder:text-white/30"
            />
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <Button type="submit" variant="gradient" className="w-full justify-center" disabled={pending}>
            {pending ? "Saving…" : "Add Holiday"}
          </Button>
        </form>
      </div>
    </div>,
    document.body
  );
}
