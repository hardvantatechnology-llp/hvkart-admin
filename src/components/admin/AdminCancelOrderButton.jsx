"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { XCircle } from "lucide-react";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { useToast } from "@/components/ui/Toast";

// Copied verbatim from hardvanta/src/components/admin/AdminCancelOrderButton.jsx.
export default function AdminCancelOrderButton({ id, status }) {
  const router = useRouter();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (status === "CANCELLED") return null;

  async function handleConfirm() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CANCELLED" }),
      });
      if (res.ok) {
        setOpen(false);
        toast.success("Order cancelled.");
        router.refresh();
        return;
      }
      const data = await res.json().catch(() => ({}));
      const message = data.error || "Could not cancel order.";
      setError(message);
      toast.error(message);
    } catch {
      const message = "Something went wrong. Please try again.";
      setError(message);
      toast.error(message);
    }
    setLoading(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="admin-focus-ring flex items-center gap-1.5 rounded-lg border border-admin-border bg-white px-3 py-1.5 text-xs font-semibold text-admin-danger transition-colors hover:bg-red-50"
      >
        <XCircle size={14} /> Cancel Order
      </button>

      <ConfirmModal
        open={open}
        onClose={() => { setOpen(false); setError(""); }}
        onConfirm={handleConfirm}
        loading={loading}
        error={error}
        title="Cancel this order?"
        description="This can't be undone. Stock will be restored and any online payment refunded."
        confirmLabel="Yes, Cancel Order"
        cancelLabel="Keep Order"
      />
    </>
  );
}
