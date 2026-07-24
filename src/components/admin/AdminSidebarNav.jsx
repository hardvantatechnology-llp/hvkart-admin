"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  LayoutDashboard, Package, ShoppingCart, Home,
  Users, Tag, Layers, Star, Ticket, Archive,
  Bell, Settings, FileText, CreditCard, Mail, BookOpen,
  TrendingUp, BarChart2, Image as ImageIcon, UserCog, Store,
  X, Building2, ClipboardList, CircuitBoard, FileBarChart,
  MapPin, Hash, SlidersHorizontal, CalendarOff, Send,
  ShieldCheck, History, UserCircle, PanelLeftClose, PanelLeftOpen,
} from "lucide-react";
import SwitchToUserView from "./SwitchToUserView";
import LogoutButton from "./LogoutButton";
import { useAdminShell } from "./AdminShellProvider";

export const SECTIONS = [
  {
    label: "Main",
    items: [
      { href: "/dashboard",           label: "Dashboard", icon: LayoutDashboard },
      { href: "/dashboard/analytics", label: "Analytics", icon: TrendingUp },
      { href: "/dashboard/products",  label: "Products",  icon: Package },
      { href: "/dashboard/orders",    label: "Orders",    icon: ShoppingCart },
    ],
  },
  {
    label: "Catalog",
    items: [
      { href: "/dashboard/categories", label: "Categories", icon: Layers },
      { href: "/dashboard/brands",     label: "Brands",     icon: Tag },
      { href: "/dashboard/inventory",  label: "Inventory",  icon: Archive },
    ],
  },
  {
    label: "Users",
    items: [
      { href: "/dashboard/customers", label: "Customers", icon: Users },
      { href: "/dashboard/users",     label: "All Users", icon: UserCog },
      { href: "/dashboard/sellers",   label: "Sellers",   icon: Store },
      { href: "/dashboard/reviews",   label: "Reviews",   icon: Star },
    ],
  },
  {
    label: "Enquiries",
    items: [
      { href: "/dashboard/enquiries/b2b",      label: "B2B / Bulk Orders",   icon: Building2 },
      { href: "/dashboard/enquiries/bulk",     label: "Bulk Enquiries",      icon: ClipboardList },
      { href: "/dashboard/enquiries/atl-kits", label: "ATL Kits Enquiries",  icon: CircuitBoard },
      { href: "/dashboard/enquiries/report",   label: "Enquiry Report",     icon: FileBarChart },
    ],
  },
  {
    label: "Finance",
    items: [
      { href: "/dashboard/coupons",  label: "Coupons",  icon: Ticket },
      { href: "/dashboard/payments", label: "Payments", icon: CreditCard },
      { href: "/dashboard/invoices", label: "Invoices", icon: FileText },
      { href: "/dashboard/reports",  label: "Reports",  icon: BarChart2 },
    ],
  },
  {
    label: "Logistics",
    items: [
      { href: "/dashboard/delivery/areas",     label: "Delivery Areas",    icon: MapPin },
      { href: "/dashboard/delivery/pincodes",  label: "Pincodes",          icon: Hash },
      { href: "/dashboard/delivery/settings",  label: "Delivery Settings", icon: SlidersHorizontal },
      { href: "/dashboard/delivery/holidays",  label: "Holiday Calendar",  icon: CalendarOff },
    ],
  },
  {
    label: "Content",
    items: [
      { href: "/dashboard/blogs",          label: "Blogs",          icon: BookOpen },
      { href: "/dashboard/banners",        label: "Banners",        icon: ImageIcon },
      { href: "/dashboard/notifications",  label: "Notifications",  icon: Bell },
      { href: "/dashboard/contact",        label: "Contact",        icon: Mail },
      { href: "/dashboard/newsletter",     label: "Newsletter",     icon: Send },
    ],
  },
  {
    label: "System",
    items: [
      { href: "/dashboard/settings", label: "Settings", icon: Settings },
      { href: "/dashboard/admins", label: "Admins", icon: ShieldCheck },
      { href: "/dashboard/activity-log", label: "Activity Log", icon: History },
      { href: "/dashboard/profile", label: "Profile", icon: UserCircle },
    ],
  },
];

export default function AdminSidebarNav() {
  const pathname = usePathname();
  const { mobileNavOpen: mobileOpen, setMobileNavOpen: setMobileOpen } = useAdminShell();
  const [collapsed, setCollapsed] = useState(false);
  const reduce = useReducedMotion();

  function isActive(href) {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <motion.aside
      animate={{ width: collapsed ? 84 : 264 }}
      transition={reduce ? { duration: 0 } : { duration: 0.2, ease: "easeInOut" }}
      className="hidden shrink-0 lg:block"
    >
      <div className="lg:sticky lg:top-6">
        <div className="rounded-2xl border border-admin-sidebar-border bg-admin-sidebar shadow-[0_1px_0_rgba(255,255,255,0.04)_inset]">
          <div className="flex items-center justify-between px-4 py-4">
            {!collapsed && (
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Admin Panel</span>
            )}
            <button
              type="button"
              onClick={() => setCollapsed((v) => !v)}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              aria-pressed={collapsed}
              className="admin-focus-ring ml-auto flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
            >
              {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
            </button>
          </div>

          <nav className="admin-scrollbar max-h-[calc(100vh-7rem)] space-y-5 overflow-y-auto px-3 pb-4">
            {SECTIONS.map((section) => (
              <div key={section.label}>
                {!collapsed && (
                  <p className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    {section.label}
                  </p>
                )}
                <div className="space-y-0.5">
                  {section.items.map(({ href, label, icon: Icon }) => {
                    const active = isActive(href);
                    return (
                      <Link
                        key={href}
                        href={href}
                        aria-current={active ? "page" : undefined}
                        title={collapsed ? label : undefined}
                        className={`admin-focus-ring group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                          collapsed ? "justify-center" : ""
                        } ${
                          active
                            ? "bg-white/10 text-white"
                            : "text-slate-400 hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        {active && (
                          <span className="absolute left-0 top-1/2 h-4 w-1 -translate-y-1/2 rounded-full bg-admin-accent" aria-hidden="true" />
                        )}
                        <Icon size={17} className="shrink-0" />
                        {!collapsed && <span className="truncate">{label}</span>}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}

            <div className="space-y-1 border-t border-white/10 pt-3">
              {!collapsed ? (
                <>
                  <SwitchToUserView />
                  <Link
                    href="/"
                    className="admin-focus-ring flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
                  >
                    <Home size={17} /> Back to store
                  </Link>
                  <LogoutButton />
                </>
              ) : (
                <Link
                  href="/"
                  title="Back to store"
                  className="admin-focus-ring flex items-center justify-center rounded-xl px-3 py-2.5 text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
                >
                  <Home size={17} />
                </Link>
              )}
            </div>
          </nav>
        </div>
      </div>

      {/* Mobile drawer — opened via the hamburger button in AdminHeader */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileOpen(false)}
          >
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
              className="admin-scrollbar h-full w-72 max-w-[85vw] overflow-y-auto bg-admin-sidebar p-4"
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Admin Panel</span>
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close navigation"
                  className="admin-focus-ring flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-white/5 hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="space-y-5">
                {SECTIONS.map((section) => (
                  <div key={section.label}>
                    <p className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                      {section.label}
                    </p>
                    <div className="space-y-0.5">
                      {section.items.map(({ href, label, icon: Icon }) => {
                        const active = isActive(href);
                        return (
                          <Link
                            key={href}
                            href={href}
                            onClick={() => setMobileOpen(false)}
                            aria-current={active ? "page" : undefined}
                            className={`relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                              active ? "bg-white/10 text-white" : "text-slate-400 hover:bg-white/5 hover:text-white"
                            }`}
                          >
                            {active && (
                              <span className="absolute left-0 top-1/2 h-4 w-1 -translate-y-1/2 rounded-full bg-admin-accent" aria-hidden="true" />
                            )}
                            <Icon size={17} /> {label}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
                <div className="space-y-1 border-t border-white/10 pt-3">
                  <SwitchToUserView />
                  <Link
                    href="/"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-400 hover:bg-white/5 hover:text-white"
                  >
                    <Home size={17} /> Back to store
                  </Link>
                  <LogoutButton />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.aside>
  );
}
