"use client";

import AdminDeleteButton from "./AdminDeleteButton";

// Copied verbatim from hardvanta/src/components/admin/DeleteReviewButton.jsx.
export default function DeleteReviewButton({ id, onDelete }) {
  async function handleDelete() {
    await onDelete(id);
  }

  return <AdminDeleteButton onDelete={handleDelete} label="this review" iconOnly={false} />;
}
