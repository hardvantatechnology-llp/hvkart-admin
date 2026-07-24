"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { Hash, X } from "lucide-react";
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
    <div className="fixed inset-0 z-[250] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4">
      <div className="admin-shell w-full max-w-md rounded-2xl border border-admin-border bg-white p-6 shadow-admin-popover">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
            <Hash size={18} className="text-admin-accent" />
            {isEdit ? "Edit Pincode" : "Add Pincode"}
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
          {isEdit && <input type="hidden" name="id" value={pincode.id} />}

          <div>
            <label className="admin-label">Pincode</label>
            <input
              name="code"
              required
              disabled={isEdit}
              defaultValue={pincode?.code || ""}
              placeholder="e.g. 201301"
              maxLength={6}
              className="admin-input disabled:opacity-50"
            />
          </div>

          <div>
            <label className="admin-label">Locality</label>
            <input
              name="areaLabel"
              required
              defaultValue={pincode?.areaLabel || ""}
              placeholder="e.g. Sector 62"
              className="admin-input"
            />
          </div>

          <div>
            <label className="admin-label">City</label>
            <select
              name="deliveryAreaId"
              required
              defaultValue={pincode?.deliveryAreaId || ""}
              className="admin-select"
            >
              <option value="" disabled>Select a city…</option>
              {areas.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-4 text-sm text-slate-700">
            <label className="flex items-center gap-2">
              <input type="checkbox" name="codAvailable" defaultChecked={pincode?.codAvailable ?? true} className="admin-checkbox" />
              Cash on Delivery
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" name="expressAvailable" defaultChecked={pincode?.expressAvailable ?? false} className="admin-checkbox" />
              Express Delivery
            </label>
          </div>

          {error && <p className="text-sm font-medium text-admin-danger">{error}</p>}
          <Button type="submit" variant="enterprise-primary" loading={pending} className="w-full justify-center">
            {pending ? "Saving…" : isEdit ? "Save Changes" : "Add Pincode"}
          </Button>
        </form>
      </div>
    </div>,
    document.body
  );
}
