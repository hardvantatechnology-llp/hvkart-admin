"use client";

import { useEffect } from "react";
import { setUserView } from "@/lib/viewMode";

// Whenever the admin area mounts, clear "user view" so admin UI is shown again.
// Copied verbatim from hardvanta/src/components/admin/AdminViewReset.jsx.
export default function AdminViewReset() {
  useEffect(() => {
    setUserView(false);
  }, []);
  return null;
}
