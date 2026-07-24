"use client";

import { createContext, useContext, useState } from "react";

const AdminShellContext = createContext(null);

/** Shares mobile-nav open state between AdminHeader (hamburger trigger) and AdminSidebarNav (drawer). */
export function AdminShellProvider({ children }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  return (
    <AdminShellContext.Provider value={{ mobileNavOpen, setMobileNavOpen }}>
      {children}
    </AdminShellContext.Provider>
  );
}

export function useAdminShell() {
  const ctx = useContext(AdminShellContext);
  if (!ctx) throw new Error("useAdminShell must be used within AdminShellProvider");
  return ctx;
}
