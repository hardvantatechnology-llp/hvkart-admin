"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, Menu, Plus, Search } from "lucide-react";
import { SECTIONS } from "@/components/admin/AdminSidebarNav";
import { useAdminShell } from "@/components/admin/AdminShellProvider";
import UserMenu from "./UserMenu";
import Breadcrumb from "./Breadcrumb";

const ALL_ITEMS = SECTIONS.flatMap((s) => s.items);

const QUICK_ACTIONS = [
  { label: "New Product", href: "/dashboard/products/new" },
  { label: "New Blog Post", href: "/dashboard/blogs/new" },
  { label: "New Admin", href: "/dashboard/admins" },
];

function useOutsideClose(onClose) {
  const ref = useRef(null);
  useEffect(() => {
    function onClick(e) {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [onClose]);
  return ref;
}

function QuickSearch() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useOutsideClose(() => setOpen(false));

  const matches = useMemo(() => {
    if (!q.trim()) return [];
    const needle = q.trim().toLowerCase();
    return ALL_ITEMS.filter((i) => i.label.toLowerCase().includes(needle)).slice(0, 6);
  }, [q]);

  function go(href) {
    router.push(href);
    setQ("");
    setOpen(false);
  }

  return (
    <div ref={ref} className="relative hidden w-full max-w-xs md:block">
      <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
      <input
        value={q}
        onChange={(e) => { setQ(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => { if (e.key === "Enter" && matches[0]) go(matches[0].href); }}
        placeholder="Jump to a section…"
        aria-label="Jump to a section"
        className="admin-input h-9 !py-0 pl-9 pr-3"
      />
      {open && matches.length > 0 && (
        <div role="listbox" className="absolute left-0 right-0 z-50 mt-2 rounded-xl border border-admin-border bg-white p-1.5 shadow-admin-popover">
          {matches.map((m) => (
            <button
              key={m.href}
              type="button"
              onClick={() => go(m.href)}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
            >
              <m.icon size={15} className="text-slate-400" /> {m.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function NotificationsMenu({ unreadCount = 0 }) {
  const [open, setOpen] = useState(false);
  const ref = useOutsideClose(() => setOpen(false));

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={`Notifications${unreadCount ? ` (${unreadCount} unread)` : ""}`}
        className="admin-focus-ring relative flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
      >
        <Bell size={17} />
        {unreadCount > 0 && (
          <span className="absolute right-1.5 top-1.5 flex h-2 w-2 rounded-full bg-admin-danger ring-2 ring-white" aria-hidden="true" />
        )}
      </button>
      {open && (
        <div className="absolute right-0 z-50 mt-2 w-72 rounded-xl border border-admin-border bg-white p-1.5 shadow-admin-popover">
          <div className="flex items-center justify-between px-3 py-2">
            <p className="text-sm font-semibold text-slate-900">Notifications</p>
            {unreadCount > 0 && <span className="admin-pill bg-red-50 text-admin-danger">{unreadCount} new</span>}
          </div>
          <Link
            href="/dashboard/notifications"
            onClick={() => setOpen(false)}
            className="block rounded-lg px-3 py-2 text-sm text-admin-accent hover:bg-blue-50"
          >
            View all notifications →
          </Link>
        </div>
      )}
    </div>
  );
}

function QuickActionsMenu() {
  const [open, setOpen] = useState(false);
  const ref = useOutsideClose(() => setOpen(false));

  return (
    <div ref={ref} className="relative hidden sm:block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label="Quick actions"
        className="admin-focus-ring flex h-9 w-9 items-center justify-center rounded-full bg-admin-accent text-white transition-colors hover:bg-admin-accent-dark"
      >
        <Plus size={17} />
      </button>
      {open && (
        <div className="absolute right-0 z-50 mt-2 w-52 rounded-xl border border-admin-border bg-white p-1.5 shadow-admin-popover">
          {QUICK_ACTIONS.map((a) => (
            <Link
              key={a.href}
              href={a.href}
              onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              {a.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminHeader({ user, unreadCount = 0 }) {
  const { setMobileNavOpen } = useAdminShell();

  return (
    <header className="sticky top-0 z-30 -mx-4 mb-6 border-b border-admin-border bg-white/80 px-4 py-3 backdrop-blur-md sm:-mx-6 sm:px-6 lg:mx-0 lg:rounded-2xl lg:border lg:px-5 lg:shadow-admin-card">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setMobileNavOpen(true)}
          aria-label="Open navigation"
          className="admin-focus-ring flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 lg:hidden"
        >
          <Menu size={18} />
        </button>

        <div className="hidden min-w-0 flex-1 lg:block">
          <Breadcrumb />
        </div>

        <div className="ml-auto flex flex-1 items-center justify-end gap-2 lg:flex-none">
          <QuickSearch />
          <QuickActionsMenu />
          <NotificationsMenu unreadCount={unreadCount} />
          <div className="ml-1 h-6 w-px bg-admin-border" aria-hidden="true" />
          <UserMenu user={user} />
        </div>
      </div>
    </header>
  );
}
