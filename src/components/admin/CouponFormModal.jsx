"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Ticket, X } from "lucide-react";
import Button from "@/components/ui/Button";

// Copied verbatim from hardvanta/src/components/admin/CouponFormModal.jsx.
function toDateInputValue(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

/**
 * Create/edit form for a coupon, shared by both flows — pass `coupon` (an
 * existing row) for edit mode, or omit it for create mode. `onSave` is the
 * bound server action (`createCoupon` or `updateCoupon`).
 */
export default function CouponFormModal({ open, onClose, coupon, onSave }) {
  const isEdit = Boolean(coupon);
  const [mounted, setMounted] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [type, setType] = useState(coupon?.type || "flat");
  const formRef = useRef(null);
  const reduce = useReducedMotion();
  const [prevOpen, setPrevOpen] = useState(open);

  // Standard SSR-safe portal mount flag — same pattern/rationale as
  // ConfirmModal.jsx/Toast.jsx (Products module). eslint-config-next 16's
  // newer react-hooks/set-state-in-effect rule flags it, but this is the
  // documented way to guard createPortal() calls.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  // Resets the transient error/type state each time the modal transitions
  // to open, using the current `coupon` at that render — same behavior as
  // the original `useEffect(() => { if (open) {...} }, [open, coupon])`,
  // rewritten as React's documented "adjust state during render" pattern to
  // satisfy the same newer lint rule (see AdminSearchInput.jsx for the same fix).
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setError("");
      setType(coupon?.type || "flat");
    }
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && !pending && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose, pending]);

  if (!mounted || !open) return null;

  function handleSubmit(e) {
    e.preventDefault();
    setError("");
    const fd = new FormData(formRef.current);
    if (isEdit) fd.set("id", coupon.id);
    startTransition(async () => {
      try {
        await onSave(fd);
        onClose();
      } catch (err) {
        setError(err?.message || "Could not save coupon.");
      }
    });
  }

  const input =
    "w-full rounded-lg glass-card px-3 py-2 text-sm text-white outline-none focus:shadow-glow-electric placeholder:text-white/30";
  const label = "mb-1 block text-xs font-semibold text-white/60";

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={reduce ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={reduce ? undefined : { opacity: 0 }}
        onClick={() => !pending && onClose()}
        className="fixed inset-0 z-[250] flex items-center justify-center overflow-y-auto bg-obsidian/70 backdrop-blur-md px-4 py-8"
      >
        <motion.div
          initial={reduce ? false : { opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={reduce ? undefined : { opacity: 0, scale: 0.95, y: 12 }}
          transition={{ type: "spring", stiffness: 340, damping: 28 }}
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          className="glass-strong w-full max-w-lg rounded-3xl p-6"
        >
          <div className="mb-4 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-lg font-bold text-white">
              <Ticket size={18} className="text-electric-light" />
              {isEdit ? "Edit Coupon" : "Create Coupon"}
            </h3>
            <button
              type="button"
              onClick={onClose}
              disabled={pending}
              className="rounded-lg p-1.5 text-white/50 hover:bg-white/10 hover:text-white"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>

          <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={label} htmlFor="coupon-code">Coupon Code *</label>
                <input
                  id="coupon-code"
                  name="code"
                  defaultValue={coupon?.code || ""}
                  required
                  disabled={pending}
                  onInput={(e) => { e.target.value = e.target.value.toUpperCase(); }}
                  placeholder="SAVE50"
                  className={`${input} uppercase`}
                />
              </div>
              <div>
                <label className={label} htmlFor="coupon-active">Status</label>
                <label className="flex items-center gap-2 rounded-lg glass-card px-3 py-2 text-sm text-white">
                  <input
                    id="coupon-active"
                    name="active"
                    type="checkbox"
                    defaultChecked={coupon ? coupon.active : true}
                    disabled={pending}
                    className="h-4 w-4 accent-electric"
                  />
                  Active
                </label>
              </div>
            </div>

            <div>
              <label className={label} htmlFor="coupon-description">Description</label>
              <textarea
                id="coupon-description"
                name="description"
                defaultValue={coupon?.description || ""}
                disabled={pending}
                rows={2}
                placeholder="Flat ₹50 off on all orders"
                className={`${input} resize-none`}
              />
            </div>

            <div>
              <span className={label}>Discount Type *</span>
              <div className="flex gap-2">
                <label className={`flex-1 cursor-pointer rounded-lg px-3 py-2 text-center text-sm font-semibold transition-colors ${type === "flat" ? "bg-gradient-to-r from-electric to-liquid text-white" : "glass-card text-white/60"}`}>
                  <input type="radio" name="type" value="flat" checked={type === "flat"} onChange={() => setType("flat")} disabled={pending} className="sr-only" />
                  Flat (₹)
                </label>
                <label className={`flex-1 cursor-pointer rounded-lg px-3 py-2 text-center text-sm font-semibold transition-colors ${type === "percent" ? "bg-gradient-to-r from-electric to-liquid text-white" : "glass-card text-white/60"}`}>
                  <input type="radio" name="type" value="percent" checked={type === "percent"} onChange={() => setType("percent")} disabled={pending} className="sr-only" />
                  Percentage (%)
                </label>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={label} htmlFor="coupon-discount">
                  Discount {type === "percent" ? "Percentage (%)" : "Value (₹)"} *
                </label>
                <input
                  id="coupon-discount"
                  name="discount"
                  type="number"
                  min="1"
                  max={type === "percent" ? "100" : undefined}
                  defaultValue={coupon?.discount ?? ""}
                  required
                  disabled={pending}
                  className={input}
                />
              </div>
              <div>
                <label className={label} htmlFor="coupon-max-discount">Maximum Discount (₹)</label>
                <input
                  id="coupon-max-discount"
                  name="maxDiscount"
                  type="number"
                  min="1"
                  defaultValue={coupon?.maxDiscount ?? ""}
                  disabled={pending}
                  placeholder="No cap"
                  className={input}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={label} htmlFor="coupon-min-order">Minimum Order Value (₹)</label>
                <input
                  id="coupon-min-order"
                  name="minOrder"
                  type="number"
                  min="0"
                  defaultValue={coupon?.minOrder ?? 0}
                  disabled={pending}
                  className={input}
                />
              </div>
              <div>
                <label className={label} htmlFor="coupon-usage-limit">Usage Limit</label>
                <input
                  id="coupon-usage-limit"
                  name="usageLimit"
                  type="number"
                  min="1"
                  defaultValue={coupon?.usageLimit ?? ""}
                  disabled={pending}
                  placeholder="Unlimited"
                  className={input}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={label} htmlFor="coupon-starts-at">Start Date</label>
                <input
                  id="coupon-starts-at"
                  name="startsAt"
                  type="date"
                  defaultValue={toDateInputValue(coupon?.startsAt)}
                  disabled={pending}
                  className={input}
                />
              </div>
              <div>
                <label className={label} htmlFor="coupon-expires-at">Expiry Date</label>
                <input
                  id="coupon-expires-at"
                  name="expiresAt"
                  type="date"
                  defaultValue={toDateInputValue(coupon?.expiresAt)}
                  disabled={pending}
                  className={input}
                />
              </div>
            </div>

            {error && <p className="text-sm font-medium text-red-400">{error}</p>}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={pending}
                className="flex-1 rounded-xl glass-card py-2.5 text-sm font-semibold text-white/70 hover:text-white transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <Button type="submit" variant="gradient" disabled={pending} className="flex-1 justify-center">
                {pending ? "Saving…" : isEdit ? "Save Changes" : "Create Coupon"}
              </Button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}
