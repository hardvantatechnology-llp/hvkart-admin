"use client";

import { useRouter } from "next/navigation";
import { UserCog } from "lucide-react";
import { setUserView } from "@/lib/viewMode";

// Admin sidebar button: enter "user view" and go to the account page.
// Copied verbatim from hardvanta/src/components/admin/SwitchToUserView.jsx.
// NOTE: "/account" is a hardvanta storefront route that does not exist in
// this standalone admin project — see the Phase 2 migration report for
// details on this cross-project link.
export default function SwitchToUserView() {
  const router = useRouter();
  return (
    <button
      onClick={() => {
        setUserView(true);
        router.push("/account");
      }}
      className="flex w-full items-center gap-3 rounded-lg bg-electric/10 px-3 py-2 text-sm font-semibold text-electric-light hover:bg-electric/15 transition-colors"
    >
      <UserCog size={16} /> Switch to User View
    </button>
  );
}
