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
          className="fixed inset-0 z-[250] flex items-center justify-center bg-obsidian/70 backdrop-blur-md px-4"
        >
          <motion.div
            initial={reduce ? false : { opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, scale: 0.95, y: 12 }}
            transition={{ type: "spring", stiffness: 340, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={description ? descId : undefined}
            className="glass-strong w-full max-w-sm rounded-3xl p-6 text-center"
          >
            <div
              className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full ${
                danger ? "bg-red-500/10 text-red-400" : "bg-electric/10 text-electric-light"
              }`}
            >
              <AlertTriangle size={22} />
            </div>
            <h3 id={titleId} className="mt-4 text-lg font-bold text-white">{title}</h3>
            {description && <p id={descId} className="mt-1.5 text-sm text-white/50">{description}</p>}
            {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

            <div className="mt-6 flex gap-3">
              <button
                onClick={onClose}
                disabled={loading}
                className="flex-1 rounded-xl glass-card py-2.5 text-sm font-semibold text-white/70 hover:text-white transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric/50"
              >
                {cancelLabel}
              </button>
              <Button
                ref={confirmRef}
                onClick={onConfirm}
                disabled={loading}
                variant={danger ? "primary" : "gradient"}
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
