import { Mail } from "lucide-react";

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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Contact Messages</h1>
        <p className="text-sm text-white/40 mt-0.5">{messages.length} total messages</p>
      </div>

      <div className="space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl glass-card py-16 text-center">
            <Mail size={40} className="mb-3 text-white/20" />
            <p className="font-semibold text-white">No messages yet</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className="rounded-2xl glass-card p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-white/90">{msg.name}</p>
                  <p className="text-sm text-white/50">{msg.email} {msg.phone && `· ${msg.phone}`}</p>
                  {msg.subject && <p className="mt-1 text-sm font-medium text-electric-light">{msg.subject}</p>}
                </div>
                <p className="text-xs text-white/40 shrink-0">
                  {new Date(msg.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </p>
              </div>
              <p className="mt-3 text-sm text-white/50 leading-relaxed">{msg.message}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
