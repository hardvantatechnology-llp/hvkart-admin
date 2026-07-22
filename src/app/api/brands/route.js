// This is the minimum read/create surface Products needs for its brand
// dropdown — copied verbatim from hardvanta/src/app/api/brands/route.js
// (only import path changed). Full brand management (edit/deactivate/delete
// via src/app/admin/brands/actions.js) is NOT migrated yet — that's a future
// Brands module phase, per Phase 3 scope.
import { NextResponse } from "next/server";
import { prisma } from "@/lib/database/prisma";
import { isAdmin } from "@/lib/auth/session";

// Without this, Next.js statically caches GET's response at build time (no
// dynamic function/request param is used here) — a brand added via POST
// would never show up in the storefront until the next deploy. Matches the
// same directive already on /api/categories and /api/products.
export const dynamic = "force-dynamic";

function slugify(str) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function GET() {
  try {
    const brands = await prisma.brand.findMany({
      where: {
        active: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json({ brands });
  } catch (err) {
    console.error("GET /api/brands error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { name } = await req.json();
    const trimmed = String(name || "").trim();
    if (!trimmed) {
      return NextResponse.json(
        { error: "Brand name is required." },
        { status: 400 }
      );
    }

    const slug = slugify(trimmed);
    if (!slug) {
      return NextResponse.json(
        { error: "Invalid brand name." },
        { status: 400 }
      );
    }

    // Create it, or return the existing one if the slug already exists.
    const brand = await prisma.brand.upsert({
      where: { slug },
      update: {},
      create: { name: trimmed, slug },
    });

    return NextResponse.json({ brand });
  } catch (err) {
    console.error("POST /api/brands error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
