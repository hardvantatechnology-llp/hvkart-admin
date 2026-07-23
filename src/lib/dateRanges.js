// Small calendar-range helpers for admin reporting (today / this week / this
// month). Pinned to Asia/Kolkata (IST) rather than the server process's own
// timezone — a UTC-hosted server (Vercel functions default to UTC) would
// otherwise bucket "today" as 5:30 AM IST -> 5:30 AM IST the next day, same
// root cause src/utils/formatDateTime.js documents for order timestamps.
// Copied verbatim from hardvanta/src/lib/dateRanges.js.
import { TIME_ZONE } from "@/utils/formatDateTime";

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30, no DST.

function getIstDateParts(date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const get = (type) => Number(parts.find((p) => p.type === type)?.value);
  return { year: get("year"), month: get("month"), day: get("day") };
}

// The UTC instant of IST midnight for the given IST calendar day.
function istMidnightUtc({ year, month, day }) {
  return new Date(Date.UTC(year, month - 1, day, 0, 0, 0) - IST_OFFSET_MS);
}

export function startOfToday(now = new Date()) {
  return istMidnightUtc(getIstDateParts(now));
}

// Calendar week starting Monday (IST).
export function startOfWeek(now = new Date()) {
  const { year, month, day } = getIstDateParts(now);
  // A UTC-midnight stand-in is enough to compute the weekday (calendar-day
  // arithmetic only, no timezone math needed) before re-deriving the actual
  // IST midnight instant for the resulting Monday.
  const calendarDay = new Date(Date.UTC(year, month - 1, day));
  const weekday = calendarDay.getUTCDay(); // 0 = Sunday
  const diffToMonday = weekday === 0 ? -6 : 1 - weekday;
  calendarDay.setUTCDate(calendarDay.getUTCDate() + diffToMonday);
  return istMidnightUtc({
    year: calendarDay.getUTCFullYear(),
    month: calendarDay.getUTCMonth() + 1,
    day: calendarDay.getUTCDate(),
  });
}

export function startOfMonth(now = new Date()) {
  const { year, month } = getIstDateParts(now);
  return istMidnightUtc({ year, month, day: 1 });
}
