"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

// Admin sidebar logout button — same visual pattern as the "Back to store"
// link right next to it (flex/gap/rounded/hover classes copied verbatim from
// AdminSidebarNav.jsx), using next-auth's signOut() same as
// src/components/auth/SignOutButton.jsx.
export default function LogoutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="admin-focus-ring flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
    >
      <LogOut size={16} /> Log out
    </button>
  );
}
