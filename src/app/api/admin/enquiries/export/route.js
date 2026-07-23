// GET /api/admin/enquiries/export?type=b2b|bulk|atl|all&format=csv|xlsx|pdf
// Admin-only. Normalizes rows from BulkEnquiry / AtlKitsEnquiry into a common
// shape and returns a downloadable CSV, Excel, or PDF file.
// Copied verbatim from hardvanta/src/app/api/admin/enquiries/export/route.js
// — only isAdmin/prisma import paths changed.
import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth/session";
import { prisma } from "@/lib/database/prisma";
import { toCsv, toXlsxBuffer, toPdfBuffer } from "@/lib/enquiryExport";
import { ENQUIRY_STATUS_LABELS } from "@/lib/enquiryStatus";

function formatDate(d) {
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function normalizeBulk(e) {
  return {
    name: e.name,
    company: e.organization || "",
    email: e.email,
    phone: e.phone,
    product: e.products,
    quantity: e.quantity,
    message: e.message || "",
    date: formatDate(e.createdAt),
    status: ENQUIRY_STATUS_LABELS[e.status] || e.status,
    source: e.enquiryType === "B2B / Bulk" ? "B2B / Bulk Order" : "Bulk Enquiry",
  };
}

function normalizeAtl(e) {
  return {
    name: e.contactPerson,
    company: e.schoolName,
    email: e.email,
    phone: e.phone,
    product: e.kits,
    quantity: e.quantity,
    message: e.message || "",
    date: formatDate(e.createdAt),
    status: ENQUIRY_STATUS_LABELS[e.status] || e.status,
    source: "ATL Kits Enquiry",
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
    const type = searchParams.get("type") || "all";
    const format = searchParams.get("format") || "csv";

    if (!["b2b", "bulk", "atl", "all"].includes(type)) {
      return NextResponse.json({ error: "Invalid type." }, { status: 400 });
    }
    if (!["csv", "xlsx", "pdf"].includes(format)) {
      return NextResponse.json({ error: "Invalid format." }, { status: 400 });
    }

    let rows = [];
    if (type === "b2b" || type === "bulk" || type === "all") {
      const where =
        type === "b2b"
          ? { enquiryType: "B2B / Bulk" }
          : type === "bulk"
          ? { NOT: { enquiryType: "B2B / Bulk" } }
          : {};
      const bulkRows = await prisma.bulkEnquiry.findMany({ where, orderBy: { createdAt: "desc" } });
      rows.push(...bulkRows.map(normalizeBulk));
    }
    if (type === "atl" || type === "all") {
      const atlRows = await prisma.atlKitsEnquiry.findMany({ orderBy: { createdAt: "desc" } });
      rows.push(...atlRows.map(normalizeAtl));
    }
    if (type === "all") {
      rows.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    const titleByType = {
      b2b: "B2B / Bulk Orders",
      bulk: "Bulk Enquiries",
      atl: "ATL Kits Enquiries",
      all: "All Enquiries",
    };
    const filenameBase = `enquiries-${type}-${new Date().toISOString().slice(0, 10)}`;

    let body;
    if (format === "csv") {
      body = toCsv(rows);
    } else if (format === "xlsx") {
      body = Buffer.from(await toXlsxBuffer(rows, titleByType[type]));
    } else {
      body = Buffer.from(await toPdfBuffer(rows, titleByType[type]));
    }

    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": CONTENT_TYPES[format],
        "Content-Disposition": `attachment; filename="${filenameBase}.${format}"`,
      },
    });
  } catch (err) {
    console.error("GET /api/admin/enquiries/export error:", err);
    return NextResponse.json({ error: "Could not export enquiries." }, { status: 500 });
  }
}
