"use client";

import AdminDeleteButton from "@/components/admin/AdminDeleteButton";
import { formatDate } from "@/utils/formatDateTime";

// Copied verbatim from hardvanta/src/components/admin/delivery/HolidayRow.jsx.
export default function HolidayRow({ holiday, onDelete }) {
  return (
    <tr className="admin-row-hover">
      <td className="admin-td whitespace-nowrap font-semibold text-slate-900">{formatDate(holiday.date)}</td>
      <td className="admin-td text-slate-500">{holiday.reason || "—"}</td>
      <td className="admin-td text-right">
        <AdminDeleteButton onDelete={() => onDelete(holiday.id)} label={formatDate(holiday.date)} />
      </td>
    </tr>
  );
}
