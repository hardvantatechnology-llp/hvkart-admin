"use client";

import { useState, useTransition } from "react";
import { Pencil } from "lucide-react";
import AdminDeleteButton from "./AdminDeleteButton";
import CouponFormModal from "./CouponFormModal";
import Badge from "./ui/Badge";
import { formatPrice } from "@/utils/formatPrice";
import { getComputedStatus } from "@/lib/couponEngine";

const STATUS_TONE = {
  ACTIVE: "green",
  INACTIVE: "slate",
  EXPIRED: "red",
  SCHEDULED: "amber",
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
      <tr className="admin-row-hover align-top">
        <td className="admin-td whitespace-nowrap font-semibold text-slate-900">{coupon.code}</td>
        <td className="admin-td max-w-xs truncate text-slate-500" title={coupon.description || ""}>{coupon.description || "—"}</td>
        <td className="admin-td whitespace-nowrap text-slate-600">{coupon.type === "percent" ? "Percentage" : "Flat"}</td>
        <td className="admin-td whitespace-nowrap text-slate-600">
          {coupon.type === "percent" ? `${coupon.discount}%` : formatPrice(coupon.discount)}
        </td>
        <td className="admin-td whitespace-nowrap text-slate-600">{formatPrice(coupon.minOrder)}</td>
        <td className="admin-td whitespace-nowrap text-slate-600">{coupon.maxDiscount ? formatPrice(coupon.maxDiscount) : "—"}</td>
        <td className="admin-td whitespace-nowrap text-slate-400">{formatDate(coupon.startsAt)}</td>
        <td className="admin-td whitespace-nowrap text-slate-400">{formatDate(coupon.expiresAt)}</td>
        <td className="admin-td whitespace-nowrap text-slate-600">{coupon.usageLimit ?? "Unlimited"}</td>
        <td className="admin-td whitespace-nowrap text-slate-600">{coupon.usedCount}</td>
        <td className="admin-td">
          <div className="flex flex-col items-start gap-1">
            <Badge tone={STATUS_TONE[status]}>{STATUS_LABELS[status]}</Badge>
            <button
              type="button"
              onClick={handleToggleActive}
              disabled={pending}
              className="disabled:opacity-50"
              title="Click to toggle Active/Inactive"
            >
              <Badge tone={coupon.active ? "green" : "slate"} dot>{coupon.active ? "Active" : "Inactive"}</Badge>
            </button>
          </div>
          {error && <p className="mt-1 text-xs text-admin-danger">{error}</p>}
        </td>
        <td className="admin-td whitespace-nowrap text-slate-400">{formatDate(coupon.createdAt)}</td>
        <td className="admin-td">
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setEditOpen(true)}
              className="text-slate-400 hover:text-admin-accent"
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
