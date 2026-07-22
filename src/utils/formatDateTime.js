// Single source of truth for rendering order-related dates. Every call pins
// `timeZone: "Asia/Kolkata"` explicitly — without it, `toLocaleDateString`
// falls back to the runtime's own timezone, which differs between a
// server-rendered page (Vercel functions default to UTC) and a "use client"
// component (the visitor's browser timezone). That mismatch is what made the
// same order timestamp render as two different calendar dates on the same
// order page.
// Copied verbatim from hardvanta/src/utils/formatDateTime.js.
export const TIME_ZONE = "Asia/Kolkata";

// Date only, e.g. "19 Jul 2026".
export function formatDate(date) {
  if (!date) return null;
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: TIME_ZONE,
  });
}

// Date + time, e.g. "19 Jul 2026, 2:08 AM".
export function formatDateTime(date) {
  if (!date) return null;
  const timePart = new Date(date)
    .toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: TIME_ZONE,
    })
    .toUpperCase();
  return `${formatDate(date)}, ${timePart}`;
}
