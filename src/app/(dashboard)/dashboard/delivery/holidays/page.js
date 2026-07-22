import { CalendarOff } from "lucide-react";
import HolidayRow from "@/components/admin/delivery/HolidayRow";
import AddHolidayButton from "@/components/admin/delivery/AddHolidayButton";
import { createHoliday, deleteHoliday } from "../actions";

// Copied verbatim from hardvanta/src/app/admin/delivery/holidays/page.js —
// only the import path for prisma changed.
export const dynamic = "force-dynamic";
export const metadata = { title: "Holiday Calendar — Admin" };

export default async function HolidaysPage() {
  const { prisma } = await import("@/lib/database/prisma");
  const holidays = await prisma.holiday.findMany({ orderBy: { date: "asc" } });

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Holiday Calendar</h1>
          <p className="text-sm text-white/40 mt-0.5">No deliveries are estimated on these dates</p>
        </div>
        <AddHolidayButton onCreate={createHoliday} />
      </div>

      <div className="overflow-hidden rounded-2xl glass-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.03] text-left text-xs font-bold uppercase tracking-wider text-white/40">
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Reason</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {holidays.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-5 py-12 text-center text-white/50">
                    <CalendarOff size={32} className="mx-auto mb-2 text-white/20" />
                    No holidays configured
                  </td>
                </tr>
              ) : (
                holidays.map((holiday) => <HolidayRow key={holiday.id} holiday={holiday} onDelete={deleteHoliday} />)
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
