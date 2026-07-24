import { Mail } from "lucide-react";
import { formatDate } from "@/utils/formatDateTime";

// Adapted from hardvanta/src/app/admin/newsletter/page.js — import path
// updated only.
export const dynamic = "force-dynamic";
export const metadata = { title: "Newsletter — Admin" };

export default async function NewsletterPage() {
  const { prisma } = await import("@/lib/database/prisma");

  const subscribers = await prisma.newsletterSubscriber.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Newsletter</h1>
        <p className="text-sm text-white/40 mt-0.5">{subscribers.length} subscriber{subscribers.length !== 1 ? "s" : ""}</p>
      </div>

      {subscribers.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl glass-card py-16 text-center">
          <Mail size={40} className="mb-3 text-white/20" />
          <p className="font-semibold text-white">No subscribers yet</p>
        </div>
      ) : (
        <div className="glass-strong rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left text-xs font-bold uppercase tracking-wider text-white/40">
                  <th className="px-5 py-3">Email</th>
                  <th className="px-5 py-3">Subscribed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {subscribers.map((s) => (
                  <tr key={s.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-5 py-3 font-semibold text-white/90">{s.email}</td>
                    <td className="px-5 py-3 text-white/40">{formatDate(s.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
