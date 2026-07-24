"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import Button from "./Button";

export default function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title = "Are you sure?",
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  loading = false,
  error,
  danger = true,
}) {
  const [mounted, setMounted] = useState(false);
  // Standard SSR-safe portal mount flag — document.body doesn't exist on the
  // server, so this stays false until after client hydration. Flagged by
  // eslint-config-next 16's newer react-hooks/set-state-in-effect rule, but
  // this exact pattern is the documented way to guard createPortal() calls.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);
  const reduce = useReducedMotion();
  const titleId = useId();
  const descId = useId();
  const confirmRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && !loading && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    confirmRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose, loading]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduce ? undefined : { opacity: 0 }}
          onClick={() => !loading && onClose()}
          className="fixed inset-0 z-[250] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4"
        >
          <motion.div
            initial={reduce ? false : { opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={description ? descId : undefined}
            className="admin-shell w-full max-w-sm rounded-2xl border border-admin-border bg-white p-6 text-center shadow-admin-popover"
          >
            <div
              className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full ${
                danger ? "bg-red-50 text-admin-danger" : "bg-blue-50 text-admin-accent"
              }`}
            >
              <AlertTriangle size={22} />
            </div>
            <h3 id={titleId} className="mt-4 text-lg font-semibold text-slate-900">{title}</h3>
            {description && <p id={descId} className="mt-1.5 text-sm text-slate-500">{description}</p>}
            {error && <p className="mt-3 text-sm text-admin-danger">{error}</p>}

            <div className="mt-6 flex gap-3">
              <button
                onClick={onClose}
                disabled={loading}
                className="flex-1 rounded-lg border border-admin-border bg-white py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-accent/40"
              >
                {cancelLabel}
              </button>
              <Button
                ref={confirmRef}
                onClick={onConfirm}
                loading={loading}
                variant={danger ? "enterprise-danger" : "enterprise-primary"}
                className="flex-1 justify-center"
              >
                {loading ? "Please wait…" : confirmLabel}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
