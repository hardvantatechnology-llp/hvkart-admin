import { CalendarOff } from "lucide-react";
import HolidayRow from "@/components/admin/delivery/HolidayRow";
import AddHolidayButton from "@/components/admin/delivery/AddHolidayButton";
import PageHeader from "@/components/admin/ui/PageHeader";
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
      <PageHeader
        title="Holiday Calendar"
        description="No deliveries are estimated on these dates"
        actions={<AddHolidayButton onCreate={createHoliday} />}
      />

      <div className="admin-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-admin-border bg-slate-50/80">
                <th className="admin-th">Date</th>
                <th className="admin-th">Reason</th>
                <th className="admin-th text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-admin-border">
              {holidays.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-5 py-12 text-center text-slate-500">
                    <CalendarOff size={32} className="mx-auto mb-2 text-slate-300" />
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
