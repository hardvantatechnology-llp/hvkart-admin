// GET /api/admin/coupons/export?format=csv|xlsx|pdf&filter=&q=
// Admin-only. Mirrors /api/admin/enquiries/export's shape. Supports the same
// optional filter/search passthrough as the admin Coupons list page so
// "export what I'm viewing" works.
// Copied verbatim from hardvanta/src/app/api/admin/coupons/export/route.js —
// only import paths changed.
import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth/session";
import { prisma } from "@/lib/database/prisma";
import { toCsv, toXlsxBuffer, toPdfBuffer } from "@/lib/couponExport";
import { getComputedStatus } from "@/lib/couponEngine";
import { buildCouponWhere } from "@/lib/couponFilters";

function formatDate(d) {
  return d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "";
}

const STATUS_LABELS = { ACTIVE: "Active", INACTIVE: "Inactive", EXPIRED: "Expired", SCHEDULED: "Scheduled" };

function normalize(coupon) {
  return {
    code: coupon.code,
    description: coupon.description || "",
    type: coupon.type === "percent" ? "Percentage" : "Flat",
    discount: coupon.type === "percent" ? `${coupon.discount}%` : coupon.discount,
    minOrder: coupon.minOrder,
    maxDiscount: coupon.maxDiscount ?? "",
    startDate: formatDate(coupon.startsAt),
    expiryDate: formatDate(coupon.expiresAt),
    usageLimit: coupon.usageLimit ?? "Unlimited",
    usedCount: coupon.usedCount,
    status: STATUS_LABELS[getComputedStatus(coupon)],
    createdDate: formatDate(coupon.createdAt),
  };
}

const CONTENT_TYPES = {
  csv: "text/csv; charset=utf-8",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  pdf: "application/pdf",
};

export async function GET(request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format") || "csv";
    const filter = searchParams.get("filter") || "";
    const q = searchParams.get("q")?.trim() || "";

    if (!["csv", "xlsx", "pdf"].includes(format)) {
      return NextResponse.json({ error: "Invalid format." }, { status: 400 });
    }

    const where = buildCouponWhere({ filter, q });
    const coupons = await prisma.coupon.findMany({ where, orderBy: { createdAt: "desc" } });
    const rows = coupons.map(normalize);

    const filenameBase = `coupons-${filter || "all"}-${new Date().toISOString().slice(0, 10)}`;

    let body;
    if (format === "csv") {
      body = toCsv(rows);
    } else if (format === "xlsx") {
      body = Buffer.from(await toXlsxBuffer(rows, "Coupons"));
    } else {
      body = Buffer.from(await toPdfBuffer(rows, "Coupons"));
    }

    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": CONTENT_TYPES[format],
        "Content-Disposition": `attachment; filename="${filenameBase}.${format}"`,
      },
    });
  } catch (err) {
    console.error("GET /api/admin/coupons/export error:", err);
    return NextResponse.json({ error: "Could not export coupons." }, { status: 500 });
  }
}
