// GET  /api/categories  → list all categories
// POST /api/categories  → create a category (admin only)
//
// This is the minimum read/create surface Products needs for its category
// dropdown — copied verbatim from hardvanta/src/app/api/categories/route.js
// (only import path changed). Full category management (edit/deactivate/
// delete via src/app/admin/categories/actions.js) is NOT migrated yet —
// that's a future Categories module phase, per Phase 3 scope.
import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { isAdmin } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
}

export async function GET() {
  const { prisma } = await import("@/lib/database/prisma");
  const categories = await prisma.category.findMany();
  return NextResponse.json({ categories });
}

export async function POST(request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { name, icon } = await request.json();
    const trimmed = String(name || "").trim();
    if (!trimmed) {
      return NextResponse.json({ error: "Category name is required." }, { status: 400 });
    }

    const slug = slugify(trimmed);
    if (!slug) {
      return NextResponse.json({ error: "Invalid category name." }, { status: 400 });
    }

    // Create it, or return the existing one if the slug already exists.
    const { prisma } = await import("@/lib/database/prisma");
    const category = await prisma.category.upsert({
      where: { slug },
      update: {},
      create: { slug, name: trimmed, icon: icon || "Box" },
    });

    revalidateTag("categories");
    return NextResponse.json({ category }, { status: 201 });
  } catch (err) {
    console.error("POST /api/categories error:", err);
    return NextResponse.json({ error: "Could not create category." }, { status: 500 });
  }
}
