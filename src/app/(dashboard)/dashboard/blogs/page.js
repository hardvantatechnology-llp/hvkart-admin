import Link from "next/link";
import Image from "next/image";
import { Plus } from "lucide-react";
import { imageSrc } from "@/utils/imageSrc";
import DeleteBlogButton from "@/components/admin/DeleteBlogButton";
import Pagination, { parsePage } from "@/components/admin/Pagination";
import Button from "@/components/ui/Button";
import PageHeader from "@/components/admin/ui/PageHeader";
import Badge from "@/components/admin/ui/Badge";

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
      <PageHeader
        title={`Blogs (${total})`}
        actions={
          <Button href="/dashboard/blogs/new" variant="enterprise-primary">
            <Plus size={18} /> Add Blog
          </Button>
        }
      />

      <div className="admin-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-admin-border bg-slate-50/80">
                <th className="admin-th">Blog</th>
                <th className="admin-th hidden sm:table-cell">Category</th>
                <th className="admin-th hidden md:table-cell">Author</th>
                <th className="admin-th">Status</th>
                <th className="admin-th text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-admin-border">
              {blogs.map((b) => (
                <tr key={b.id} className="admin-row-hover">
                  <td className="admin-td">
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded bg-slate-100">
                        <Image src={imageSrc(b.coverImage)} alt={b.title} fill sizes="40px" className="object-cover" />
                      </div>
                      <span className="line-clamp-1 font-medium text-slate-900">{b.title}</span>
                    </div>
                  </td>
                  <td className="admin-td hidden text-slate-500 sm:table-cell">{b.category}</td>
                  <td className="admin-td hidden text-slate-500 md:table-cell">{b.author}</td>
                  <td className="admin-td">
                    <Badge tone={b.published ? "green" : "slate"}>
                      {b.published ? "Published" : "Draft"}
                    </Badge>
                  </td>
                  <td className="admin-td">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        href={`/dashboard/blogs/${b.id}/edit`}
                        className="font-semibold text-admin-accent hover:text-admin-accent-dark"
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
