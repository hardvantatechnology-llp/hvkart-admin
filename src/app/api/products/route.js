// GET /api/products?category=<slug>&featured=true&q=<search>&page=<n>&limit=<n>
// Copied verbatim from hardvanta/src/app/api/products/route.js — only import
// paths changed (@/lib/admin -> @/lib/auth/session, @/lib/prisma -> @/lib/database/prisma).
import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { isAdmin } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

const DEFAULT_LIMIT = 24;
const MAX_LIMIT = 100;
const MAX_QUERY_LENGTH = 100;
const MAX_CATEGORY_LENGTH = 100;

function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const rawCategory = searchParams.get("category");
  const featured = searchParams.get("featured");
  const rawQ = searchParams.get("q");

  // Validate/cap category (used as an exact slug match, so just bound its length).
  const category =
    typeof rawCategory === "string" && rawCategory.trim()
      ? rawCategory.trim().slice(0, MAX_CATEGORY_LENGTH)
      : null;

  // Cap the search term length to keep the insensitive OR scan bounded.
  const q =
    typeof rawQ === "string" && rawQ.trim()
      ? rawQ.trim().slice(0, MAX_QUERY_LENGTH)
      : null;

  // Pagination — validated with sane caps to avoid unbounded full-table scans.
  const pageParam = parseInt(searchParams.get("page"), 10);
  const limitParam = parseInt(searchParams.get("limit"), 10);
  const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;
  const limit =
    Number.isFinite(limitParam) && limitParam > 0
      ? Math.min(limitParam, MAX_LIMIT)
      : DEFAULT_LIMIT;

  const where = {};
  if (category) {
    where.category = {
      slug: category,
    };
  }
  if (featured === "true") where.featured = true;
  if (q) {
    where.OR = [
      {
        name: {
          contains: q,
          mode: "insensitive",
        },
      },
      {
        brand: {
          name: {
            contains: q,
            mode: "insensitive",
          },
        },
      },
    ];
  }

  const { prisma } = await import("@/lib/database/prisma");
  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      // Card/list views never render the full description — omit it so a
      // paginated catalog fetch doesn't pull that (potentially large) text
      // column for every row on every page.
      omit: { description: true },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        brand: { select: { id: true, name: true, slug: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);

  return NextResponse.json({
    products,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  });
}

// POST /api/products — create a product (admin only).
export async function POST(request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const body = await request.json();
  const {
    name,
    description,
    price,
    salePrice,
    stock,
    image,
    images,
    featured,
    categoryId,
    brandId,
    sku,
  } = body;

  // Gallery images (array). Fall back to the single `image` for old callers.
  const gallery = Array.isArray(images) && images.length ? images : image ? [image] : [];
  const mainImage = image || gallery[0];

  if (
    !name ||
    !description ||
    !price ||
    !categoryId ||
    !brandId ||
    !sku ||
    !mainImage
  ) {
    return NextResponse.json(
      { error: "Missing required fields." },
      { status: 400 }
    );
  }

  const priceNum = Number(price);
  const stockNum = stock === undefined || stock === null || stock === "" ? 0 : Number(stock);
  const salePriceNum =
    salePrice !== null && salePrice !== undefined && salePrice !== "" ? Number(salePrice) : null;
  if (!Number.isFinite(priceNum) || priceNum < 0) {
    return NextResponse.json({ error: "Price must be a non-negative number." }, { status: 400 });
  }
  if (!Number.isInteger(stockNum) || stockNum < 0) {
    return NextResponse.json({ error: "Stock must be a non-negative whole number." }, { status: 400 });
  }
  if (salePriceNum !== null && (!Number.isFinite(salePriceNum) || salePriceNum < 0)) {
    return NextResponse.json({ error: "Sale price must be a non-negative number." }, { status: 400 });
  }

  const { prisma } = await import("@/lib/database/prisma");

  let slug = slugify(name);
  // Best-effort uniqueness pre-check (final safety net is the create() catch below,
  // which protects against the race between two concurrent requests).
  let attempts = 0;
  while ((await prisma.product.findUnique({ where: { slug } })) && attempts < 5) {
    slug = `${slugify(name)}-${Math.floor(Math.random() * 10000)}`;
    attempts += 1;
  }

  try {
    const product = await prisma.product.create({
      data: {
        slug,
        sku,
        name,
        description,
        price: priceNum,
        salePrice: salePriceNum,
        stock: stockNum,
        image: mainImage,
        featured: Boolean(featured),

        category: {
          connect: {
            id: categoryId,
          },
        },

        brand: {
          connect: {
            id: brandId,
          },
        },

        images: {
          create: gallery.map((imageUrl) => ({ imageUrl })),
        },
      },
    });
    revalidateTag("products");
    return NextResponse.json({ product }, { status: 201 });
  } catch (err) {
    if (err.code === "P2002") {
      const target = Array.isArray(err.meta?.target) ? err.meta.target.join(", ") : "field";
      return NextResponse.json(
        { error: `A product with this ${target} already exists.` },
        { status: 409 }
      );
    }
    if (err.code === "P2025" || err.code === "P2003") {
      return NextResponse.json(
        { error: "Invalid categoryId or brandId." },
        { status: 400 }
      );
    }
    console.error("POST /api/products error:", err);
    return NextResponse.json(
      { error: "Could not create product." },
      { status: 500 }
    );
  }
}
