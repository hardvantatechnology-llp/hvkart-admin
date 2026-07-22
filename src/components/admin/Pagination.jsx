import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Numbered pagination for admin list pages.
 * Server-renderable (no client hooks) — just builds `?page=n` links,
 * preserving any other current search params (e.g. a search query).
 * Copied verbatim from hardvanta/src/components/admin/Pagination.jsx.
 */
export default function Pagination({ page, totalPages, basePath, searchParams = {} }) {
  if (totalPages <= 1) return null;

  function hrefFor(p) {
    const params = new URLSearchParams(searchParams);
    if (p <= 1) params.delete("page");
    else params.set("page", String(p));
    const qs = params.toString();
    return `${basePath}${qs ? `?${qs}` : ""}`;
  }

  const pages = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, start + 4);
  for (let i = start; i <= end; i++) pages.push(i);

  const pillClass = (active) =>
    `flex h-9 min-w-9 items-center justify-center rounded-full px-2 text-sm font-medium transition-all ${
      active
        ? "bg-gradient-to-r from-electric to-liquid text-white shadow-glow-electric"
        : "glass text-white/70 hover:text-white hover:shadow-glow-electric"
    }`;

  const disabledClass = "flex h-9 w-9 items-center justify-center rounded-full glass text-white/20 cursor-not-allowed";

  return (
    <div className="mt-4 flex items-center justify-between gap-4">
      <p className="text-sm text-white/40">
        Page {page} of {totalPages}
      </p>
      <nav aria-label="Pagination" className="flex items-center gap-1.5">
        {page > 1 ? (
          <Link href={hrefFor(page - 1)} className={pillClass(false)} aria-label="Previous page">
            <ChevronLeft size={15} />
          </Link>
        ) : (
          <span className={disabledClass} aria-hidden="true"><ChevronLeft size={15} /></span>
        )}

        {start > 1 && (
          <>
            <Link href={hrefFor(1)} className={pillClass(false)}>1</Link>
            {start > 2 && <span className="px-1 text-white/30">…</span>}
          </>
        )}

        {pages.map((p) => (
          <Link key={p} href={hrefFor(p)} className={pillClass(p === page)} aria-current={p === page ? "page" : undefined}>
            {p}
          </Link>
        ))}

        {end < totalPages && (
          <>
            {end < totalPages - 1 && <span className="px-1 text-white/30">…</span>}
            <Link href={hrefFor(totalPages)} className={pillClass(false)}>{totalPages}</Link>
          </>
        )}

        {page < totalPages ? (
          <Link href={hrefFor(page + 1)} className={pillClass(false)} aria-label="Next page">
            <ChevronRight size={15} />
          </Link>
        ) : (
          <span className={disabledClass} aria-hidden="true"><ChevronRight size={15} /></span>
        )}
      </nav>
    </div>
  );
}

/** Parse a `?page=` searchParam into a safe positive integer. */
export function parsePage(searchParams) {
  const n = parseInt(searchParams?.page, 10);
  return Number.isFinite(n) && n > 0 ? n : 1;
}
