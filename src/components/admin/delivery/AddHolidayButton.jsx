"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import Button from "@/components/ui/Button";
import AddHolidayModal from "./AddHolidayModal";

// Copied verbatim from hardvanta/src/components/admin/delivery/AddHolidayButton.jsx.
export default function AddHolidayButton({ onCreate }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="gradient" onClick={() => setOpen(true)}>
        <Plus size={16} /> Add Holiday
      </Button>
      <AddHolidayModal open={open} onClose={() => setOpen(false)} onSave={onCreate} />
    </>
  );
}
