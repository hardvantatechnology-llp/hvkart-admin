"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { KeyRound, X, Eye, EyeOff } from "lucide-react";
import Button from "@/components/ui/Button";

// New file — no Hardvanta equivalent. Same portal/mounted/prevOpen structure
// as AdminUserFormModal.jsx / CouponFormModal.jsx, scoped to a single
// "set new password" field bound to the resetAdminPassword Server Action.
export default function ResetAdminPasswordModal({ open, onClose, admin, onReset }) {
  const [mounted, setMounted] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const formRef = useRef(null);
  const reduce = useReducedMotion();
  const [prevOpen, setPrevOpen] = useState(open);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) setError("");
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
    fd.set("id", admin.id);
    startTransition(async () => {
      try {
        await onReset(fd);
        onClose();
      } catch (err) {
        setError(err?.message || "Could not reset password.");
      }
    });
  }

  const input = "admin-input";
  const label = "admin-label";

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={reduce ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={reduce ? undefined : { opacity: 0 }}
        onClick={() => !pending && onClose()}
        className="fixed inset-0 z-[250] flex items-center justify-center overflow-y-auto bg-slate-900/40 backdrop-blur-sm px-4 py-8"
      >
        <motion.div
          initial={reduce ? false : { opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={reduce ? undefined : { opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          className="admin-shell w-full max-w-sm rounded-2xl border border-admin-border bg-white p-6 shadow-admin-popover"
        >
          <div className="mb-4 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
              <KeyRound size={18} className="text-admin-accent" />
              Reset Password
            </h3>
            <button
              type="button"
              onClick={onClose}
              disabled={pending}
              className="admin-focus-ring rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-900"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>

          <p className="mb-4 text-sm text-slate-500">
            Set a new password for <span className="font-semibold text-slate-700">{admin?.email}</span>. This signs them out of any other active session.
          </p>

          <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={label} htmlFor="reset-new-password">New Password *</label>
              <div className="relative">
                <input
                  id="reset-new-password"
                  name="newPassword"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  minLength={8}
                  disabled={pending}
                  placeholder="Minimum 8 characters"
                  className={`${input} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && <p className="text-sm font-medium text-admin-danger">{error}</p>}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={pending}
                className="admin-focus-ring flex-1 rounded-lg border border-admin-border bg-white py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50"
              >
                Cancel
              </button>
              <Button type="submit" variant="enterprise-primary" loading={pending} className="flex-1 justify-center">
                {pending ? "Resetting…" : "Reset Password"}
              </Button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}
