"use client";

import { useState, useTransition } from "react";
import { Pencil, KeyRound } from "lucide-react";
import AdminDeleteButton from "./AdminDeleteButton";
import AdminUserFormModal from "./AdminUserFormModal";
import ResetAdminPasswordModal from "./ResetAdminPasswordModal";
import { formatDateTime } from "@/utils/formatDateTime";

// New file — no Hardvanta equivalent. Row structure and the active/inactive
// toggle button copied from the shape of CouponRow.jsx's status toggle.
export default function AdminUserRow({ admin, currentUserId, onUpdate, onToggleActive, onDelete, onResetPassword }) {
  const [editOpen, setEditOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  const isSelf = admin.id === currentUserId;

  function handleToggleActive() {
    setError("");
    startTransition(async () => {
      try {
        await onToggleActive(admin.id, !admin.isActive);
      } catch (err) {
        setError(err?.message || "Could not update status.");
      }
    });
  }

  return (
    <>
      <tr className="hover:bg-white/5 transition-colors align-top">
        <td className="px-5 py-3 font-semibold text-white/90 whitespace-nowrap">
          {admin.name || "—"} {isSelf && <span className="text-xs font-normal text-white/40">(you)</span>}
        </td>
        <td className="px-5 py-3 text-white/50">{admin.email}</td>
        <td className="px-5 py-3">
          <button
            type="button"
            onClick={handleToggleActive}
            disabled={pending || isSelf}
            title={isSelf ? "You cannot disable your own account" : "Click to toggle Active/Disabled"}
            className={`w-fit rounded-full px-2.5 py-1 text-xs font-semibold transition-colors disabled:opacity-50 ${
              admin.isActive ? "bg-cyan/10 text-cyan hover:bg-cyan/20" : "bg-red-500/10 text-red-400 hover:bg-red-500/20"
            }`}
          >
            {admin.isActive ? "🟢 Active" : "⚪ Disabled"}
          </button>
          {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
        </td>
        <td className="px-5 py-3 text-white/40 whitespace-nowrap">
          {admin.lastLoginAt ? formatDateTime(admin.lastLoginAt) : "Never"}
        </td>
        <td className="px-5 py-3 text-white/40 whitespace-nowrap">{formatDateTime(admin.createdAt)}</td>
        <td className="px-5 py-3">
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setResetOpen(true)}
              className="text-white/40 hover:text-electric-light"
              aria-label={`Reset password for ${admin.email}`}
              title="Reset password"
            >
              <KeyRound size={16} />
            </button>
            <button
              type="button"
              onClick={() => setEditOpen(true)}
              className="text-white/40 hover:text-electric-light"
              aria-label={`Edit ${admin.email}`}
              title="Edit"
            >
              <Pencil size={16} />
            </button>
            <AdminDeleteButton
              onDelete={() => onDelete(admin.id)}
              label={admin.email}
              disabled={isSelf}
              disabledTitle="You cannot delete your own account"
            />
          </div>
        </td>
      </tr>

      <AdminUserFormModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        admin={admin}
        onSave={onUpdate}
      />
      <ResetAdminPasswordModal
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        admin={admin}
        onReset={onResetPassword}
      />
    </>
  );
}
