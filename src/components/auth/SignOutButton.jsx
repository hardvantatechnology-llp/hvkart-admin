"use client";

import { signOut } from "next-auth/react";

export default function SignOutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="text-sm font-medium text-zinc-500 hover:text-red-600"
    >
      Sign out
    </button>
  );
}
