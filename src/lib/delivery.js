// Serviceability + delivery-date estimation for the Delhi-NCR-only delivery
// location feature. All date/time math is pinned to Asia/Kolkata (never the
// server process's own timezone) via the same technique as
// src/utils/formatDateTime.js, so a cutoff-time comparison never drifts
// depending on whether it runs on a UTC server or in a browser.
// Copied verbatim from hardvanta/src/lib/delivery.js — only the prisma
// import path changed. checkServiceability/getDeliveryEstimate are used by
// hardvanta's storefront (not migrated here); they're part of this file's
// existing export surface and are kept as-is rather than split out.
import { prisma } from "@/lib/database/prisma";
import { TIME_ZONE } from "@/utils/formatDateTime";

export const SETTINGS_ID = "singleton";

const PINCODE_RE = /^[1-9][0-9]{5}$/;

function getIstParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);
  const get = (type) => Number(parts.find((p) => p.type === type)?.value);
  return { year: get("year"), month: get("month"), day: get("day"), hour: get("hour"), minute: get("minute") };
}

// UTC-midnight Date representing the IST calendar day `date` falls on —
// lets every later comparison use plain UTC getters (no DST in India).
function istCalendarDate({ year, month, day }) {
  return new Date(Date.UTC(year, month - 1, day));
}

function addDays(utcMidnight, days) {
  const d = new Date(utcMidnight);
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

function parseCutoffTime(cutoffTime) {
  const [hour, minute] = String(cutoffTime || "14:00").split(":").map(Number);
  return { hour: hour || 0, minute: minute || 0 };
}

function isSameCalendarDay(a, b) {
  return a.getTime() === b.getTime();
}

function holidaySet(holidays) {
  return new Set(
    holidays.map((h) => {
      const d = h.date ? new Date(h.date) : new Date(h);
      return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
    })
  );
}

function formatDeliveryLabel(candidate, today) {
  const tomorrow = addDays(today, 1);
  const dayAfter = addDays(today, 2);
  const monthDay = candidate.toLocaleDateString("en-IN", { day: "numeric", month: "long", timeZone: "UTC" });
  if (isSameCalendarDay(candidate, tomorrow)) return `Tomorrow, ${monthDay}`;
  if (isSameCalendarDay(candidate, dayAfter)) return `Day after tomorrow, ${monthDay}`;
  const weekday = candidate.toLocaleDateString("en-IN", { weekday: "short", timeZone: "UTC" });
  return `${weekday}, ${monthDay}`;
}

/**
 * Pure delivery-date calculation — no IO. Before the cutoff time, the base
 * estimate is "tomorrow"; at/after cutoff, it's "day after tomorrow". Any
 * extra `daysToAdd` (admin-configured standard transit days) is added on
 * top, then the result is pushed forward day-by-day over any holiday.
 * @returns {{ date: Date, label: string }} `date` is a UTC-midnight Date
 *   standing in for the IST calendar delivery day.
 */
export function calculateDeliveryDate({ now = new Date(), cutoffTime = "14:00", holidays = [], daysToAdd = 0 } = {}) {
  const nowIst = getIstParts(now);
  const today = istCalendarDate(nowIst);
  const { hour: cutoffHour, minute: cutoffMinute } = parseCutoffTime(cutoffTime);
  const isBeforeCutoff = nowIst.hour < cutoffHour || (nowIst.hour === cutoffHour && nowIst.minute < cutoffMinute);
  const baseOffset = isBeforeCutoff ? 1 : 2;

  let candidate = addDays(today, baseOffset + Math.max(0, daysToAdd));
  const holidayTimestamps = holidaySet(holidays);
  while (holidayTimestamps.has(candidate.getTime())) {
    candidate = addDays(candidate, 1);
  }

  return { date: candidate, label: formatDeliveryLabel(candidate, today) };
}

/** The IST instant of today's (or, if already past, tomorrow's) cutoff — used for the "order within Xh Ym" countdown. */
export function nextCutoffDeadline({ now = new Date(), cutoffTime = "14:00" } = {}) {
  const nowIst = getIstParts(now);
  const { hour, minute } = parseCutoffTime(cutoffTime);
  // Build the cutoff instant by taking "now" and shifting to the target IST
  // wall-clock hour/minute, using the IST/UTC offset implied by `now` itself.
  const nowUtcMs = now.getTime();
  const istOffsetMs = Date.UTC(nowIst.year, nowIst.month - 1, nowIst.day, nowIst.hour, nowIst.minute) - nowUtcMs;
  let cutoff = new Date(Date.UTC(nowIst.year, nowIst.month - 1, nowIst.day, hour, minute) - istOffsetMs);
  if (cutoff.getTime() <= nowUtcMs) cutoff = new Date(cutoff.getTime() + 24 * 60 * 60 * 1000);
  return cutoff;
}

/** Always-one-row singleton getter; creates the default row on first read. */
export async function getDeliverySettings() {
  return prisma.deliverySettings.upsert({
    where: { id: SETTINGS_ID },
    update: {},
    create: { id: SETTINGS_ID },
  });
}

/**
 * Serviceability lookup by pincode.
 * @returns {Promise<{serviceable:false,reason:string}|{serviceable:true,pincode:object,deliveryArea:object}>}
 */
export async function checkServiceability(pincode) {
  const code = String(pincode || "").trim();
  if (!PINCODE_RE.test(code)) {
    return { serviceable: false, reason: "INVALID_FORMAT" };
  }
  const row = await prisma.pincode.findUnique({
    where: { code },
    include: { deliveryArea: true },
  });
  if (!row) return { serviceable: false, reason: "NOT_FOUND" };
  if (!row.active) return { serviceable: false, reason: "PINCODE_DISABLED" };
  if (!row.deliveryArea.active) return { serviceable: false, reason: "AREA_DISABLED" };
  return {
    serviceable: true,
    pincode: { code: row.code, areaLabel: row.areaLabel, codAvailable: row.codAvailable, expressAvailable: row.expressAvailable },
    deliveryArea: { id: row.deliveryArea.id, name: row.deliveryArea.name, slug: row.deliveryArea.slug },
  };
}

/** Combined serviceability + delivery-date estimate for one pincode. */
export async function getDeliveryEstimate(pincode, { now = new Date() } = {}) {
  const serviceability = await checkServiceability(pincode);
  if (!serviceability.serviceable) return serviceability;

  const [settings, holidays] = await Promise.all([
    getDeliverySettings(),
    prisma.holiday.findMany({ select: { date: true } }),
  ]);

  const { date, label } = calculateDeliveryDate({
    now,
    cutoffTime: settings.cutoffTime,
    holidays,
    daysToAdd: settings.standardDeliveryDaysToAdd,
  });

  return {
    ...serviceability,
    delivery: { date, label },
    cutoffDeadline: nextCutoffDeadline({ now, cutoffTime: settings.cutoffTime }),
    settings: {
      codEnabled: settings.codEnabled,
      expressEnabled: settings.expressEnabled,
      freeShippingThreshold: settings.freeShippingThreshold,
      deliveryCharge: settings.deliveryCharge,
    },
  };
}
