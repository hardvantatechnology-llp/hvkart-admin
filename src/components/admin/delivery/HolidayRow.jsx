"use client";

import AdminDeleteButton from "@/components/admin/AdminDeleteButton";
import { formatDate } from "@/utils/formatDateTime";

// Copied verbatim from hardvanta/src/components/admin/delivery/HolidayRow.jsx.
export default function HolidayRow({ holiday, onDelete }) {
  return (
    <tr className="hover:bg-white/5 transition-colors">
      <td className="px-5 py-3 font-semibold text-white/90 whitespace-nowrap">{formatDate(holiday.date)}</td>
      <td className="px-5 py-3 text-white/60">{holiday.reason || "—"}</td>
      <td className="px-5 py-3 text-right">
        <AdminDeleteButton onDelete={() => onDelete(holiday.id)} label={formatDate(holiday.date)} />
      </td>
    </tr>
  );
}
