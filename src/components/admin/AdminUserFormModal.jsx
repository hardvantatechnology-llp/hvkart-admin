"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ShieldCheck, X, Eye, EyeOff } from "lucide-react";
import Button from "@/components/ui/Button";

// New file — no Hardvanta equivalent (Admin Users management is a
// hvkart-admin-only feature). Structure (portal/mounted flag, prevOpen reset,
// Escape+scroll-lock effect, input/label class constants, useTransition
// submit) copied from CouponFormModal.jsx. Pass `admin` for edit mode
// (password field omitted — use ResetAdminPasswordModal for that), or omit it
// for create mode.
export default function AdminUserFormModal({ open, onClose, admin, onSave }) {
  const isEdit = Boolean(admin);
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
    if (isEdit) fd.set("id", admin.id);
    startTransition(async () => {
      try {
        await onSave(fd);
        onClose();
      } catch (err) {
        setError(err?.message || "Could not save admin.");
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
          className="glass-strong w-full max-w-md rounded-3xl p-6"
        >
          <div className="mb-4 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-lg font-bold text-white">
              <ShieldCheck size={18} className="text-electric-light" />
              {isEdit ? "Edit Admin" : "Add Admin"}
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
            <div>
              <label className={label} htmlFor="admin-name">Name *</label>
              <input
                id="admin-name"
                name="name"
                defaultValue={admin?.name || ""}
                required
                disabled={pending}
                placeholder="Jane Doe"
                className={input}
              />
            </div>

            <div>
              <label className={label} htmlFor="admin-email">Email *</label>
              <input
                id="admin-email"
                name="email"
                type="email"
                defaultValue={admin?.email || ""}
                required
                disabled={pending}
                placeholder="jane@example.com"
                className={input}
              />
            </div>

            {!isEdit && (
              <div>
                <label className={label} htmlFor="admin-password">Password *</label>
                <div className="relative">
                  <input
                    id="admin-password"
                    name="password"
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
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            )}

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
                {pending ? "Saving…" : isEdit ? "Save Changes" : "Add Admin"}
              </Button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}
