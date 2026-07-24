import { Image as ImageIcon } from "lucide-react";

// Copied verbatim from hardvanta/src/app/admin/banners/page.js — no changes
// needed (static content, no prisma/route dependency).
export const dynamic = "force-dynamic";
export const metadata = { title: "Banners — Admin" };

export default async function BannersPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Banners</h1>
        <p className="text-sm text-white/40 mt-0.5">Manage homepage banners</p>
      </div>

      <div className="rounded-2xl glass-card overflow-hidden">
        <div className="px-5 py-4 border-b border-white/10">
          <p className="text-xs font-bold uppercase tracking-wider text-electric-light">Current Banners</p>
        </div>

        {/* Banner list */}
        <div className="divide-y divide-white/10">
          {[
            { title: "Hero Banner", location: "Homepage Hero", status: "Active" },
            { title: "Deals Banner", location: "Homepage Deals Section", status: "Active" },
            { title: "Promo Banner", location: "Homepage Bottom", status: "Active" },
          ].map((banner) => (
            <div key={banner.title} className="flex items-center justify-between px-5 py-4">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-20 items-center justify-center rounded-lg bg-white/5">
                  <ImageIcon size={20} className="text-white/20" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white/90">{banner.title}</p>
                  <p className="text-xs text-white/40">{banner.location}</p>
                </div>
              </div>
              <span className="rounded-full bg-cyan/10 px-2.5 py-1 text-xs font-semibold text-cyan">
                {banner.status}
              </span>
            </div>
          ))}
        </div>

        <div className="px-5 py-4 bg-white/[0.02] border-t border-white/10">
          <p className="text-xs text-white/40">
            💡 To update banners, edit the Hero and section components in <code className="bg-white/10 px-1 rounded text-white/60">src/components/home/</code>
          </p>
        </div>
      </div>
    </div>
  );
}
