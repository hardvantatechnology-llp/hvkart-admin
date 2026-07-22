import { FileSpreadsheet, FileText, FileDown } from "lucide-react";

/** Download links for an admin export API route (CSV/Excel/PDF).
 * Copied verbatim from hardvanta/src/components/admin/ExportButtons.jsx. */
export default function ExportButtons({ endpoint = "/api/admin/enquiries/export", params = {} }) {
  const formats = [
    { format: "csv", label: "CSV", Icon: FileDown },
    { format: "xlsx", label: "Excel", Icon: FileSpreadsheet },
    { format: "pdf", label: "PDF", Icon: FileText },
  ];

  function hrefFor(format) {
    const qs = new URLSearchParams({ ...params, format }).toString();
    return `${endpoint}?${qs}`;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {formats.map(({ format, label, Icon }) => (
        <a
          key={format}
          href={hrefFor(format)}
          className="inline-flex items-center gap-1.5 rounded-lg glass-card px-3 py-1.5 text-xs font-semibold text-white/80 hover:text-white hover:shadow-glow-electric transition-all"
        >
          <Icon size={14} /> Export {label}
        </a>
      ))}
    </div>
  );
}
