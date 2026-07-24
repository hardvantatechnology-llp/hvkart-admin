"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, LayoutDashboard } from "lucide-react";
import { SECTIONS } from "@/components/admin/AdminSidebarNav";

const LABELS = Object.fromEntries(
  SECTIONS.flatMap((s) => s.items).map((item) => [item.href, item.label])
);

/** Auto-derived breadcrumb trail from the current /dashboard/... path. */
export default function Breadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  const crumbs = segments.map((seg, i) => {
    const href = "/" + segments.slice(0, i + 1).join("/");
    const label = LABELS[href] || seg.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    return { href, label };
  });

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm">
      <Link href="/dashboard" className="flex items-center text-slate-400 hover:text-slate-700">
        <LayoutDashboard size={14} />
      </Link>
      {crumbs.map((c, i) => {
        const isLast = i === crumbs.length - 1;
        return (
          <span key={c.href} className="flex items-center gap-1.5">
            <ChevronRight size={13} className="text-slate-300" aria-hidden="true" />
            {isLast ? (
              <span className="font-medium text-slate-900" aria-current="page">{c.label}</span>
            ) : (
              <Link href={c.href} className="text-slate-500 hover:text-slate-700">{c.label}</Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
