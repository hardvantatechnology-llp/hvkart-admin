"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import Button from "@/components/ui/Button";

// Adapted from hardvanta/src/components/admin/delivery/PincodeFormModal.jsx.
// Same react-hooks/set-state-in-effect fix as AddAreaModal.jsx — see that
// file's comment for rationale. No behavior change.
/** Create/edit form for a Pincode. Pass `pincode` for edit mode, omit for create. */
export default function PincodeFormModal({ open, onClose, pincode, areas, onSave }) {
  const isEdit = Boolean(pincode);
  const [mounted, setMounted] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const formRef = useRef(null);
  const [prevOpen, setPrevOpen] = useState(open);
  const [prevPincode, setPrevPincode] = useState(pincode);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  // Mirrors the original's `useEffect(..., [open, pincode])` dependency
  // array exactly: reference-equality checks on both `open` and `pincode`,
  // guarded by `if (open)`, just evaluated during render instead of in an effect.
  if (open !== prevOpen || pincode !== prevPincode) {
    setPrevOpen(open);
    setPrevPincode(pincode);
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
      <div className="glass-strong w-full max-w-md rounded-3xl p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">{isEdit ? "Edit Pincode" : "Add Pincode"}</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="text-white/50 hover:text-white">
            <X size={18} />
          </button>
        </div>
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-3">
          {isEdit && <input type="hidden" name="id" value={pincode.id} />}

          <div>
            <label className="mb-1 block text-xs font-semibold text-white/50">Pincode</label>
            <input
              name="code"
              required
              disabled={isEdit}
              defaultValue={pincode?.code || ""}
              placeholder="e.g. 201301"
              maxLength={6}
              className="w-full rounded-lg glass-card px-3 py-2.5 text-sm text-white outline-none focus:shadow-glow-electric placeholder:text-white/30 disabled:opacity-50"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-white/50">Locality</label>
            <input
              name="areaLabel"
              required
              defaultValue={pincode?.areaLabel || ""}
              placeholder="e.g. Sector 62"
              className="w-full rounded-lg glass-card px-3 py-2.5 text-sm text-white outline-none focus:shadow-glow-electric placeholder:text-white/30"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-white/50">City</label>
            <select
              name="deliveryAreaId"
              required
              defaultValue={pincode?.deliveryAreaId || ""}
              className="w-full rounded-lg glass-card px-3 py-2.5 text-sm text-white outline-none focus:shadow-glow-electric"
            >
              <option value="" disabled>Select a city…</option>
              {areas.map((a) => (
                <option key={a.id} value={a.id} className="bg-graphite">{a.name}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-4 text-sm text-white/70">
            <label className="flex items-center gap-2">
              <input type="checkbox" name="codAvailable" defaultChecked={pincode?.codAvailable ?? true} />
              Cash on Delivery
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" name="expressAvailable" defaultChecked={pincode?.expressAvailable ?? false} />
              Express Delivery
            </label>
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}
          <Button type="submit" variant="gradient" className="w-full justify-center" disabled={pending}>
            {pending ? "Saving…" : isEdit ? "Save Changes" : "Add Pincode"}
          </Button>
        </form>
      </div>
    </div>,
    document.body
  );
}
