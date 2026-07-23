// CSV / Excel / PDF generation for the admin "Enquiry Report" export buttons.
// Rows are pre-normalized by the caller to:
//   { name, company, email, phone, product, quantity, message, date, status, source }
// Copied verbatim from hardvanta/src/lib/enquiryExport.js.
import * as tableExport from "./tableExport";

export const EXPORT_COLUMNS = [
  { key: "name", label: "Name", width: 22 },
  { key: "company", label: "Company", width: 26 },
  { key: "email", label: "Email", width: 28 },
  { key: "phone", label: "Phone", width: 14 },
  { key: "product", label: "Product", width: 34 },
  { key: "quantity", label: "Quantity", width: 12 },
  { key: "message", label: "Message", width: 40 },
  { key: "date", label: "Date", width: 14 },
  { key: "status", label: "Status", width: 14 },
  { key: "source", label: "Source", width: 20 },
];

export function toCsv(rows) {
  return tableExport.toCsv(rows, EXPORT_COLUMNS);
}

export async function toXlsxBuffer(rows, sheetName = "Enquiries") {
  return tableExport.toXlsxBuffer(rows, EXPORT_COLUMNS, sheetName);
}

export async function toPdfBuffer(rows, title = "Enquiry Report") {
  return tableExport.toPdfBuffer(rows, EXPORT_COLUMNS, title);
}
