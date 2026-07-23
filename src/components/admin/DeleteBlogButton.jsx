"use client";

import { useRouter } from "next/navigation";
import AdminDeleteButton from "./AdminDeleteButton";

// Copied verbatim from hardvanta/src/components/admin/DeleteBlogButton.jsx.
export default function DeleteBlogButton({ id, title }) {
  const router = useRouter();

  async function handleDelete() {
    const res = await fetch(`/api/blogs/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data?.error || "Could not delete blog.");
    }
    router.refresh();
  }

  return <AdminDeleteButton onDelete={handleDelete} label={title} iconOnly={false} />;
}
