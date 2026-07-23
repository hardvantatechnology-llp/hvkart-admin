// Shared enquiry status constants — used by both client components
// (EnquiryStatusSelect) and server code (admin list/report pages, export API).
// Copied verbatim from hardvanta/src/lib/enquiryStatus.js.

export const ENQUIRY_STATUSES = ["NEW", "CONTACTED", "QUOTATION_SENT", "WON", "LOST", "COMPLETED"];

export const ENQUIRY_STATUS_LABELS = {
  NEW: "New",
  CONTACTED: "Contacted",
  QUOTATION_SENT: "Quotation Sent",
  WON: "Won",
  LOST: "Lost",
  COMPLETED: "Completed",
};

export const ENQUIRY_STATUS_STYLES = {
  NEW: "bg-electric/10 text-electric-light",
  CONTACTED: "bg-amber-500/10 text-amber-300",
  QUOTATION_SENT: "bg-liquid/10 text-liquid-light",
  WON: "bg-cyan/10 text-cyan",
  LOST: "bg-red-500/10 text-red-400",
  COMPLETED: "bg-white/10 text-white/70",
};
