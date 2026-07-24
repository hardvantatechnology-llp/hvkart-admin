/** Building blocks for skeleton loading states across admin pages. Server-renderable, no client hooks. */

export function SkeletonLine({ className = "" }) {
  return <div className={`admin-skeleton h-3.5 ${className}`} />;
}

export function SkeletonCard() {
  return (
    <div className="admin-card p-5">
      <div className="flex items-start justify-between">
        <SkeletonLine className="w-20" />
        <div className="admin-skeleton h-9 w-9 rounded-xl" />
      </div>
      <div className="admin-skeleton mt-3 h-7 w-24 rounded-md" />
    </div>
  );
}

export function SkeletonStatGrid({ count = 4 }) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function SkeletonTable({ rows = 6, cols = 5 }) {
  return (
    <div className="admin-card overflow-hidden">
      <div className="border-b border-admin-border bg-slate-50/60 px-4 py-3">
        <div className="flex gap-6">
          {Array.from({ length: cols }).map((_, i) => (
            <SkeletonLine key={i} className="w-20" />
          ))}
        </div>
      </div>
      <div className="divide-y divide-admin-border">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex gap-6 px-4 py-4">
            {Array.from({ length: cols }).map((_, c) => (
              <SkeletonLine key={c} className={c === 0 ? "w-32" : "w-16"} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
