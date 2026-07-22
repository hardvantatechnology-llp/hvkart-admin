// CSV / Excel / PDF generation for the admin Coupons export buttons. Rows
// are pre-normalized by the caller to match EXPORT_COLUMNS below.
// Copied verbatim from hardvanta/src/lib/couponExport.js.
import * as tableExport from "./tableExport";

export const EXPORT_COLUMNS = [
  { key: "code", label: "Coupon Code", width: 16 },
  { key: "description", label: "Description", width: 30 },
  { key: "type", label: "Discount Type", width: 14 },
  { key: "discount", label: "Discount Value", width: 14 },
  { key: "minOrder", label: "Min Order", width: 14 },
  { key: "maxDiscount", label: "Max Discount", width: 14 },
  { key: "startDate", label: "Start Date", width: 14 },
  { key: "expiryDate", label: "Expiry Date", width: 14 },
  { key: "usageLimit", label: "Usage Limit", width: 12 },
  { key: "usedCount", label: "Used Count", width: 12 },
  { key: "status", label: "Status", width: 12 },
  { key: "createdDate", label: "Created Date", width: 14 },
];

export function toCsv(rows) {
  return tableExport.toCsv(rows, EXPORT_COLUMNS);
}

export async function toXlsxBuffer(rows, sheetName = "Coupons") {
  return tableExport.toXlsxBuffer(rows, EXPORT_COLUMNS, sheetName);
}

export async function toPdfBuffer(rows, title = "Coupons") {
  return tableExport.toPdfBuffer(rows, EXPORT_COLUMNS, title);
}
