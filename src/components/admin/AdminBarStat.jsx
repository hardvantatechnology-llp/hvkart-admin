"use client";

import { motion, useReducedMotion } from "framer-motion";

// Adapted from hardvanta/src/components/admin/AdminBarStat.jsx — flat solid
// fills for the enterprise light theme (no gradients/glow).
const FILLS = {
  PENDING: "bg-amber-500",
  PROCESSING: "bg-admin-accent",
  SHIPPED: "bg-violet-500",
  DELIVERED: "bg-admin-success",
  CANCELLED: "bg-admin-danger",
};

export default function AdminBarStat({ label, count, pct }) {
  const reduce = useReducedMotion();
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="font-medium text-slate-700">{label}</span>
        <span className="text-slate-400">{count} ({pct}%)</span>
      </div>
      <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
        <motion.div
          initial={reduce ? false : { width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className={`h-full rounded-full ${FILLS[label] || "bg-slate-400"}`}
        />
      </div>
    </div>
  );
}
