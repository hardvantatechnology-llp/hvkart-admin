import { Image as ImageIcon } from "lucide-react";
import PageHeader from "@/components/admin/ui/PageHeader";
import Badge from "@/components/admin/ui/Badge";

// Copied verbatim from hardvanta/src/app/admin/banners/page.js — no changes
// needed (static content, no prisma/route dependency).
export const dynamic = "force-dynamic";
export const metadata = { title: "Banners — Admin" };

export default async function BannersPage() {
  return (
    <div>
      <PageHeader title="Banners" description="Manage homepage banners" />

      <div className="admin-card overflow-hidden">
        <div className="border-b border-admin-border px-5 py-4">
          <p className="text-xs font-bold uppercase tracking-wider text-admin-accent">Current Banners</p>
        </div>

        {/* Banner list */}
        <div className="divide-y divide-admin-border">
          {[
            { title: "Hero Banner", location: "Homepage Hero", status: "Active" },
            { title: "Deals Banner", location: "Homepage Deals Section", status: "Active" },
            { title: "Promo Banner", location: "Homepage Bottom", status: "Active" },
          ].map((banner) => (
            <div key={banner.title} className="flex items-center justify-between px-5 py-4">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-20 items-center justify-center rounded-lg bg-slate-50">
                  <ImageIcon size={20} className="text-slate-300" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{banner.title}</p>
                  <p className="text-xs text-slate-400">{banner.location}</p>
                </div>
              </div>
              <Badge tone="green">{banner.status}</Badge>
            </div>
          ))}
        </div>

        <div className="border-t border-admin-border bg-slate-50/80 px-5 py-4">
          <p className="text-xs text-slate-400">
            💡 To update banners, edit the Hero and section components in <code className="rounded bg-slate-100 px-1 text-slate-600">src/components/home/</code>
          </p>
        </div>
      </div>
    </div>
  );
}
