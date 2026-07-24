const TONES = {
  slate: "bg-slate-100 text-slate-600",
  blue: "bg-blue-50 text-blue-700",
  green: "bg-green-50 text-green-700",
  amber: "bg-amber-50 text-amber-700",
  red: "bg-red-50 text-red-700",
  purple: "bg-violet-50 text-violet-700",
};

const DOTS = {
  slate: "bg-slate-400",
  blue: "bg-blue-500",
  green: "bg-green-500",
  amber: "bg-amber-500",
  red: "bg-red-500",
  purple: "bg-violet-500",
};

/**
 * Premium status pill for the admin panel — soft background, no borders,
 * optional leading dot. `tone` picks the color family; callers map their own
 * domain statuses (order status, payment status, active/inactive, …) to a tone.
 */
export default function Badge({ tone = "slate", dot = false, className = "", children }) {
  return (
    <span className={`admin-pill ${TONES[tone] || TONES.slate} ${className}`}>
      {dot && <span className={`h-1.5 w-1.5 rounded-full ${DOTS[tone] || DOTS.slate}`} aria-hidden="true" />}
      {children}
    </span>
  );
}
