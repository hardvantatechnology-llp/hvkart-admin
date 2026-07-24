"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import Button from "@/components/ui/Button";
import CouponFormModal from "./CouponFormModal";

// Copied verbatim from hardvanta/src/components/admin/AddCouponButton.jsx.
export default function AddCouponButton({ onCreate }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="enterprise-primary" onClick={() => setOpen(true)}>
        <Plus size={16} /> Add Coupon
      </Button>
      <CouponFormModal open={open} onClose={() => setOpen(false)} onSave={onCreate} />
    </>
  );
}
