// GET /api/blogs — list blogs (admin use; public pages query Prisma directly).
// POST /api/blogs — create a new blog (admin only).
// Copied verbatim from hardvanta/src/app/api/blogs/route.js — only import
// paths changed.
import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth/session";

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { prisma } = await import("@/lib/database/prisma");
    const blogs = await prisma.blog.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json(blogs);
  } catch (err) {
    console.error("GET /api/blogs error:", err);
    return NextResponse.json({ error: "Could not load blogs." }, { status: 500 });
  }
}

export async function POST(request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { prisma } = await import("@/lib/database/prisma");
    const body = await request.json();
    const { title, slug, excerpt, content, coverImage, category, author, published } = body;

    if (!title || !slug || !excerpt || !content) {
      return NextResponse.json(
        { error: "Title, slug, excerpt and content are required." },
        { status: 400 }
      );
    }

    const existing = await prisma.blog.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json(
        { error: "A blog with this slug already exists." },
        { status: 400 }
      );
    }

    const blog = await prisma.blog.create({
      data: {
        title,
        slug,
        excerpt,
        content,
        coverImage: coverImage || "",
        category: category || "General",
        author: author || "Hardvanta Team",
        published: published ?? true,
      },
    });
    return NextResponse.json(blog, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: `Could not create blog: ${err?.message || "unknown error"}` },
      { status: 500 }
    );
  }
}
