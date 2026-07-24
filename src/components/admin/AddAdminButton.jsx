"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import Button from "@/components/ui/Button";
import AdminUserFormModal from "./AdminUserFormModal";

// New file — no Hardvanta equivalent. Same shape as AddCouponButton.jsx.
export default function AddAdminButton({ onCreate }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="gradient" onClick={() => setOpen(true)}>
        <Plus size={16} /> Add Admin
      </Button>
      <AdminUserFormModal open={open} onClose={() => setOpen(false)} onSave={onCreate} />
    </>
  );
}
