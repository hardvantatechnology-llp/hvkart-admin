"use client";

import { motion, useReducedMotion } from "framer-motion";

// Copied verbatim from hardvanta/src/components/admin/AdminBarStat.jsx.
const FILLS = {
  PENDING: "bg-gradient-to-r from-amber-400 to-amber-500",
  PROCESSING: "bg-gradient-to-r from-electric to-electric-light",
  SHIPPED: "bg-gradient-to-r from-liquid to-liquid-light",
  DELIVERED: "bg-gradient-to-r from-cyan to-cyan-light",
  CANCELLED: "bg-gradient-to-r from-red-500 to-red-400",
};

export default function AdminBarStat({ label, count, pct }) {
  const reduce = useReducedMotion();
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="font-medium text-white/85">{label}</span>
        <span className="text-white/40">{count} ({pct}%)</span>
      </div>
      <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
        <motion.div
          initial={reduce ? false : { width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className={`h-full rounded-full ${FILLS[label] || "bg-white/40"}`}
        />
      </div>
    </div>
  );
}
