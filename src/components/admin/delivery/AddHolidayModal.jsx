"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { CalendarOff, X } from "lucide-react";
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
    <div className="fixed inset-0 z-[250] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4">
      <div className="admin-shell w-full max-w-sm rounded-2xl border border-admin-border bg-white p-6 shadow-admin-popover">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
            <CalendarOff size={18} className="text-admin-accent" />
            Add Holiday
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
          <div>
            <label className="admin-label">Date</label>
            <input
              type="date"
              name="date"
              required
              className="admin-input"
            />
          </div>
          <div>
            <label className="admin-label">Reason (optional)</label>
            <input
              name="reason"
              placeholder="e.g. Diwali"
              className="admin-input"
            />
          </div>
          {error && <p className="text-sm font-medium text-admin-danger">{error}</p>}
          <Button type="submit" variant="enterprise-primary" loading={pending} className="w-full justify-center">
            {pending ? "Saving…" : "Add Holiday"}
          </Button>
        </form>
      </div>
    </div>,
    document.body
  );
}
