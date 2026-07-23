import Link from "next/link";
import Image from "next/image";
import { Plus } from "lucide-react";
import { imageSrc } from "@/utils/imageSrc";
import DeleteBlogButton from "@/components/admin/DeleteBlogButton";
import Pagination, { parsePage } from "@/components/admin/Pagination";
import Button from "@/components/ui/Button";

// Adapted from hardvanta/src/app/admin/blogs/page.js — searchParams is a
// Promise in Next.js 16 (awaited below), import path updated, and all
// /admin/blogs hrefs remapped to /dashboard/blogs.
export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

export default async function AdminBlogsPage({ searchParams: searchParamsPromise }) {
  const searchParams = await searchParamsPromise;
  const { prisma } = await import("@/lib/database/prisma");
  const page = parsePage(searchParams);
  const [blogs, total] = await Promise.all([
    prisma.blog.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        category: true,
        author: true,
        published: true,
        coverImage: true,
      },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.blog.count(),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Blogs ({total})</h1>
        <Button href="/dashboard/blogs/new" variant="gradient">
          <Plus size={18} /> Add Blog
        </Button>
      </div>

      <div className="overflow-hidden rounded-2xl glass-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-white/10 bg-white/[0.03] text-left text-xs uppercase text-white/40">
              <tr>
                <th className="px-4 py-3">Blog</th>
                <th className="hidden px-4 py-3 sm:table-cell">Category</th>
                <th className="hidden px-4 py-3 md:table-cell">Author</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {blogs.map((b) => (
                <tr key={b.id} className="border-b border-white/10 last:border-0 hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded bg-white/5">
                        <Image src={imageSrc(b.coverImage)} alt={b.title} fill sizes="40px" className="object-cover" />
                      </div>
                      <span className="line-clamp-1 font-medium text-white/90">{b.title}</span>
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 text-white/50 sm:table-cell">{b.category}</td>
                  <td className="hidden px-4 py-3 text-white/50 md:table-cell">{b.author}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        b.published
                          ? "bg-cyan/10 text-cyan"
                          : "bg-white/10 text-white/50"
                      }`}
                    >
                      {b.published ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        href={`/dashboard/blogs/${b.id}/edit`}
                        className="font-semibold text-electric-light hover:text-cyan"
                      >
                        Edit
                      </Link>
                      <DeleteBlogButton id={b.id} title={b.title} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination page={page} totalPages={totalPages} basePath="/dashboard/blogs" />
    </div>
  );
}
