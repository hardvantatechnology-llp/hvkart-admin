// PATCH /api/bulk-enquiry/[id] — update an enquiry's status (admin only).
// Serves both the "B2B / Bulk Orders" and "Bulk Enquiries" admin sections,
// which are just two filtered views over this same table.
// Copied verbatim from hardvanta/src/app/api/bulk-enquiry/[id]/route.js —
// only the isAdmin import path changed.
import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth/session";
import { prisma } from "@/lib/database/prisma";

const VALID_STATUSES = ["NEW", "CONTACTED", "QUOTATION_SENT", "WON", "LOST", "COMPLETED"];

export async function PATCH(request, { params }) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { status } = await request.json();
    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: "Invalid status." }, { status: 400 });
    }

    const enquiry = await prisma.bulkEnquiry
      .update({ where: { id: params.id }, data: { status } })
      .catch(() => null);

    if (!enquiry) {
      return NextResponse.json({ error: "Enquiry not found." }, { status: 404 });
    }
    return NextResponse.json({ enquiry });
  } catch (err) {
    console.error("PATCH /api/bulk-enquiry/[id] error:", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
