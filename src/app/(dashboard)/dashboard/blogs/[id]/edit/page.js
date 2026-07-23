import { notFound } from "next/navigation";
import BlogForm from "@/components/admin/BlogForm";

// Copied verbatim from hardvanta/src/app/admin/blogs/[id]/edit/page.js — only
// the import path for prisma changed. `params` was already awaited in the
// source (Next 15+ pattern), no change needed there.
export const dynamic = "force-dynamic";

export default async function EditBlogPage({ params }) {
  const { id } = await params;
  const { prisma } = await import("@/lib/database/prisma");
  const blog = await prisma.blog.findUnique({ where: { id } });
  if (!blog) notFound();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-white">Edit Blog</h1>
      <BlogForm initial={blog} />
    </div>
  );
}
