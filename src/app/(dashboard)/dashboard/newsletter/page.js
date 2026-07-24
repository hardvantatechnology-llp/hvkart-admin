import { Mail } from "lucide-react";
import { formatDate } from "@/utils/formatDateTime";
import PageHeader from "@/components/admin/ui/PageHeader";
import EmptyState from "@/components/admin/ui/EmptyState";

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
      <PageHeader
        title="Newsletter"
        description={`${subscribers.length} subscriber${subscribers.length !== 1 ? "s" : ""}`}
      />

      {subscribers.length === 0 ? (
        <EmptyState icon={Mail} title="No subscribers yet" />
      ) : (
        <div className="admin-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-admin-border bg-slate-50/80">
                  <th className="admin-th">Email</th>
                  <th className="admin-th">Subscribed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-admin-border">
                {subscribers.map((s) => (
                  <tr key={s.id} className="admin-row-hover">
                    <td className="admin-td font-semibold text-slate-900">{s.email}</td>
                    <td className="admin-td text-slate-400">{formatDate(s.createdAt)}</td>
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
