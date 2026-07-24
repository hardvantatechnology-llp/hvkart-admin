import Button from "@/components/ui/Button";

/**
 * Standard "nothing here yet" block for admin tables/lists.
 * `action` is optional: { label, href } or { label, onClick }.
 */
export default function EmptyState({ icon: Icon, title = "Nothing here yet", description, action }) {
  return (
    <div className="admin-card flex flex-col items-center gap-3 px-6 py-16 text-center">
      {Icon && (
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 text-slate-400">
          <Icon size={26} strokeWidth={1.5} />
        </span>
      )}
      <div className="space-y-1">
        <p className="text-sm font-semibold text-slate-900">{title}</p>
        {description && <p className="max-w-sm text-sm text-slate-500">{description}</p>}
      </div>
      {action && (
        <Button
          variant="enterprise-primary"
          size="sm"
          href={action.href}
          onClick={action.onClick}
          className="mt-2"
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}
