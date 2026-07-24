"use client";

import { useState, useTransition } from "react";
import { Pencil, KeyRound } from "lucide-react";
import AdminDeleteButton from "./AdminDeleteButton";
import AdminUserFormModal from "./AdminUserFormModal";
import ResetAdminPasswordModal from "./ResetAdminPasswordModal";
import Badge from "./ui/Badge";
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
      <tr className="admin-row-hover align-top">
        <td className="admin-td whitespace-nowrap font-semibold text-slate-900">
          {admin.name || "—"} {isSelf && <span className="text-xs font-normal text-slate-400">(you)</span>}
        </td>
        <td className="admin-td text-slate-500">{admin.email}</td>
        <td className="admin-td">
          <button
            type="button"
            onClick={handleToggleActive}
            disabled={pending || isSelf}
            title={isSelf ? "You cannot disable your own account" : "Click to toggle Active/Disabled"}
            className="disabled:opacity-50"
          >
            <Badge tone={admin.isActive ? "green" : "red"} dot>{admin.isActive ? "Active" : "Disabled"}</Badge>
          </button>
          {error && <p className="mt-1 text-xs text-admin-danger">{error}</p>}
        </td>
        <td className="admin-td whitespace-nowrap text-slate-400">
          {admin.lastLoginAt ? formatDateTime(admin.lastLoginAt) : "Never"}
        </td>
        <td className="admin-td whitespace-nowrap text-slate-400">{formatDateTime(admin.createdAt)}</td>
        <td className="admin-td">
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setResetOpen(true)}
              className="text-slate-400 hover:text-admin-accent"
              aria-label={`Reset password for ${admin.email}`}
              title="Reset password"
            >
              <KeyRound size={16} />
            </button>
            <button
              type="button"
              onClick={() => setEditOpen(true)}
              className="text-slate-400 hover:text-admin-accent"
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
