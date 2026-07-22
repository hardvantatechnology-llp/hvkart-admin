"use client";

import { motion, useReducedMotion } from "framer-motion";

// Copied verbatim from hardvanta/src/components/admin/AdminStatCard.jsx.
const GLOWS = {
  electric: "hover:shadow-glow-electric",
  cyan: "hover:shadow-glow-cyan",
  purple: "hover:shadow-glow-purple",
  red: "hover:shadow-[0_0_40px_-8px_rgba(248,113,113,0.45)]",
  amber: "hover:shadow-[0_0_40px_-8px_rgba(245,158,11,0.45)]",
};

const ICON_BG = {
  electric: "bg-electric/10 text-electric-light",
  cyan: "bg-cyan/10 text-cyan",
  purple: "bg-liquid/10 text-liquid-light",
  red: "bg-red-500/10 text-red-400",
  amber: "bg-amber-500/10 text-amber-300",
};

export default function AdminStatCard({ label, value, icon, glow = "electric", delay = 0 }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={`glass-card rounded-2xl p-5 transition-shadow ${GLOWS[glow]}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm text-white/50">{label}</span>
        {icon && (
          <span className={`flex h-9 w-9 items-center justify-center rounded-full ${ICON_BG[glow]}`}>
            {icon}
          </span>
        )}
      </div>
      <p className="mt-2 text-2xl font-bold text-white">{value}</p>
    </motion.div>
  );
}
