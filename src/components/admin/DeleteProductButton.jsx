"use client";

import AdminDeleteButton from "./AdminDeleteButton";

// Adapted from hardvanta/src/components/admin/DeleteProductButton.jsx —
// only the redirect target changed (/admin/products -> /dashboard/products),
// matching this project's routes established in Phase 1/2.
export default function DeleteProductButton({ id, name }) {
  async function handleDelete() {
    const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Could not delete product.");
    window.location.href = "/dashboard/products";
  }

  return <AdminDeleteButton onDelete={handleDelete} label={name} />;
}
