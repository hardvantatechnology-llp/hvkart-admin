"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

// `glow` is the legacy prop name (electric/cyan/purple/red/amber) from the
// dark-glass design — kept so every existing caller (Admins, Analytics,
// Coupons, Enquiry Report, Inventory, Reports, Sellers, Users pages) upgrades
// to the new premium look with no changes of their own. It maps 1:1 onto the
// light-theme icon tones below.
const TONE_ALIAS = {
  electric: "blue",
  cyan: "green",
  purple: "purple",
  red: "red",
  amber: "amber",
};

const ICON_TONES = {
  blue: "bg-blue-50 text-blue-600",
  green: "bg-green-50 text-green-600",
  amber: "bg-amber-50 text-amber-600",
  red: "bg-red-50 text-red-600",
  purple: "bg-violet-50 text-violet-600",
  slate: "bg-slate-100 text-slate-600",
};

/**
 * Premium KPI card for the admin dashboard/list pages.
 * `trend` is optional: { value: 12.4, direction: "up" | "down", label?: string }.
 */
export default function AdminStatCard({ label, value, icon, glow = "electric", trend, delay = 0 }) {
  const reduce = useReducedMotion();
  const tone = TONE_ALIAS[glow] || "blue";
  const trendUp = trend?.direction === "up";

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
      className="admin-card admin-card-hover p-5"
    >
      <div className="flex items-start justify-between">
        <span className="text-sm font-medium text-slate-500">{label}</span>
        {icon && (
          <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${ICON_TONES[tone]}`}>
            {icon}
          </span>
        )}
      </div>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">{value}</p>
      {trend && (
        <div className="mt-2 flex items-center gap-1 text-xs font-semibold">
          <span className={`flex items-center gap-0.5 ${trendUp ? "text-green-600" : "text-red-600"}`}>
            {trendUp ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
            {Math.abs(trend.value)}%
          </span>
          {trend.label && <span className="font-normal text-slate-400">{trend.label}</span>}
        </div>
      )}
    </motion.div>
  );
}
