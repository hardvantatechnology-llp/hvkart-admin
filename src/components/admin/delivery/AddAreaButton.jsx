"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import Button from "@/components/ui/Button";
import AddAreaModal from "./AddAreaModal";

// Copied verbatim from hardvanta/src/components/admin/delivery/AddAreaButton.jsx.
export default function AddAreaButton({ onCreate }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="enterprise-primary" onClick={() => setOpen(true)}>
        <Plus size={16} /> Add City
      </Button>
      <AddAreaModal open={open} onClose={() => setOpen(false)} onSave={onCreate} />
    </>
  );
}
