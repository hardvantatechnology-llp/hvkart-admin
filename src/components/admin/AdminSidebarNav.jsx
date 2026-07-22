"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Package, ShoppingCart, Home,
  Users, Tag, Layers, Star, Ticket, Archive,
  Bell, Settings, FileText, CreditCard, Mail, BookOpen,
  TrendingUp, BarChart2, Image as ImageIcon, UserCog, Store,
  Menu, X, Building2, ClipboardList, CircuitBoard, FileBarChart,
  MapPin, Hash, SlidersHorizontal, CalendarOff, Send,
} from "lucide-react";
import SwitchToUserView from "./SwitchToUserView";

// Adapted from hardvanta/src/components/admin/AdminSidebarNav.jsx — same
// sections, labels, icons, and order. Only the URL prefix changed
// (/admin -> /dashboard), matching this project's own protected route root
// established in Phase 1. Pages not yet migrated will 404 until their phase,
// same as any nav item pointing at an unbuilt page.
const SECTIONS = [
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
    ],
  },
];

export default function AdminSidebarNav() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  function isActive(href) {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <aside className="lg:w-64 shrink-0">
      <div className="glass-strong rounded-2xl p-3 lg:sticky lg:top-24">
        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          aria-expanded={mobileOpen}
          aria-controls="admin-sidebar-nav"
          className="flex w-full items-center justify-between px-3 py-2 text-xs font-semibold uppercase tracking-wide text-white/40 lg:pointer-events-none"
        >
          Admin Panel
          <span className="lg:hidden text-white/60">
            {mobileOpen ? <X size={16} /> : <Menu size={16} />}
          </span>
        </button>

        <nav id="admin-sidebar-nav" className={`space-y-4 ${mobileOpen ? "block" : "hidden"} lg:block`}>
          {SECTIONS.map((section) => (
            <div key={section.label}>
              <p className="px-3 pb-1 text-[10px] font-bold uppercase tracking-widest text-white/40">
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
                      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                        active
                          ? "bg-gradient-to-r from-electric to-liquid text-white shadow-glow-electric"
                          : "text-white/70 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <Icon size={16} /> {label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}

          <div className="space-y-1 border-t border-white/10 pt-2">
            <SwitchToUserView />
            <Link
              href="/"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-white/50 hover:bg-white/5 hover:text-white transition-colors"
            >
              <Home size={16} /> Back to store
            </Link>
          </div>
        </nav>
      </div>
    </aside>
  );
}
