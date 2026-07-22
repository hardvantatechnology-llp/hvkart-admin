"use client";

import { useState, useTransition } from "react";
import { Pencil } from "lucide-react";
import AdminDeleteButton from "./AdminDeleteButton";
import CouponFormModal from "./CouponFormModal";
import { formatPrice } from "@/utils/formatPrice";
import { getComputedStatus } from "@/lib/couponEngine";

// Copied verbatim from hardvanta/src/components/admin/CouponRow.jsx.
const STATUS_STYLES = {
  ACTIVE: "bg-cyan/10 text-cyan",
  INACTIVE: "bg-white/10 text-white/60",
  EXPIRED: "bg-red-500/10 text-red-400",
  SCHEDULED: "bg-amber-500/10 text-amber-300",
};

const STATUS_LABELS = {
  ACTIVE: "Active",
  INACTIVE: "Inactive",
  EXPIRED: "Expired",
  SCHEDULED: "Scheduled",
};

function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default function CouponRow({ coupon, onUpdate, onToggleActive, onDelete }) {
  const [editOpen, setEditOpen] = useState(false);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  const status = getComputedStatus(coupon);

  function handleToggleActive() {
    setError("");
    startTransition(async () => {
      try {
        await onToggleActive(coupon.id, !coupon.active);
      } catch (err) {
        setError(err?.message || "Could not update status.");
      }
    });
  }

  return (
    <>
      <tr className="hover:bg-white/5 transition-colors align-top">
        <td className="px-5 py-3 font-semibold text-white/90 whitespace-nowrap">{coupon.code}</td>
        <td className="px-5 py-3 text-white/50 max-w-xs truncate" title={coupon.description || ""}>{coupon.description || "—"}</td>
        <td className="px-5 py-3 text-white/60 whitespace-nowrap">{coupon.type === "percent" ? "Percentage" : "Flat"}</td>
        <td className="px-5 py-3 text-white/60 whitespace-nowrap">
          {coupon.type === "percent" ? `${coupon.discount}%` : formatPrice(coupon.discount)}
        </td>
        <td className="px-5 py-3 text-white/60 whitespace-nowrap">{formatPrice(coupon.minOrder)}</td>
        <td className="px-5 py-3 text-white/60 whitespace-nowrap">{coupon.maxDiscount ? formatPrice(coupon.maxDiscount) : "—"}</td>
        <td className="px-5 py-3 text-white/40 whitespace-nowrap">{formatDate(coupon.startsAt)}</td>
        <td className="px-5 py-3 text-white/40 whitespace-nowrap">{formatDate(coupon.expiresAt)}</td>
        <td className="px-5 py-3 text-white/60 whitespace-nowrap">{coupon.usageLimit ?? "Unlimited"}</td>
        <td className="px-5 py-3 text-white/60 whitespace-nowrap">{coupon.usedCount}</td>
        <td className="px-5 py-3">
          <div className="flex flex-col gap-1">
            <span className={`inline-block w-fit rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[status]}`}>
              {STATUS_LABELS[status]}
            </span>
            <button
              type="button"
              onClick={handleToggleActive}
              disabled={pending}
              className={`w-fit rounded-full px-2.5 py-1 text-xs font-semibold transition-colors disabled:opacity-50 ${
                coupon.active ? "bg-cyan/10 text-cyan hover:bg-cyan/20" : "bg-red-500/10 text-red-400 hover:bg-red-500/20"
              }`}
              title="Click to toggle Active/Inactive"
            >
              {coupon.active ? "🟢 Active" : "⚪ Inactive"}
            </button>
          </div>
          {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
        </td>
        <td className="px-5 py-3 text-white/40 whitespace-nowrap">{formatDate(coupon.createdAt)}</td>
        <td className="px-5 py-3">
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setEditOpen(true)}
              className="text-white/40 hover:text-electric-light"
              aria-label={`Edit ${coupon.code}`}
              title="Edit"
            >
              <Pencil size={16} />
            </button>
            <AdminDeleteButton
              onDelete={() => onDelete(coupon.id)}
              label={coupon.code}
            />
          </div>
        </td>
      </tr>

      <CouponFormModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        coupon={coupon}
        onSave={onUpdate}
      />
    </>
  );
}
