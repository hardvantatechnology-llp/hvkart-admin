import { Mail } from "lucide-react";
import PageHeader from "@/components/admin/ui/PageHeader";
import EmptyState from "@/components/admin/ui/EmptyState";

// Adapted from hardvanta/src/app/admin/contact/page.js — import path
// updated only.
export const dynamic = "force-dynamic";
export const metadata = { title: "Contact Messages — Admin" };

export default async function ContactPage() {
  const { prisma } = await import("@/lib/database/prisma");

  const messages = await prisma.contactMessage.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div>
      <PageHeader title="Contact Messages" description={`${messages.length} total messages`} />

      <div className="space-y-4">
        {messages.length === 0 ? (
          <EmptyState icon={Mail} title="No messages yet" />
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className="admin-card p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-slate-900">{msg.name}</p>
                  <p className="text-sm text-slate-500">{msg.email} {msg.phone && `· ${msg.phone}`}</p>
                  {msg.subject && <p className="mt-1 text-sm font-medium text-admin-accent">{msg.subject}</p>}
                </div>
                <p className="text-xs text-slate-400 shrink-0">
                  {new Date(msg.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </p>
              </div>
              <p className="mt-3 text-sm text-slate-500 leading-relaxed">{msg.message}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
