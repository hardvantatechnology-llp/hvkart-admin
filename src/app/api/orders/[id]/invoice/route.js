// Copied verbatim from hardvanta/src/app/api/orders/[id]/invoice/route.js —
// import paths updated, and `params` is now awaited (Promise in Next.js 16).
// Note: as in hardvanta, nothing currently links to this route (no UI calls
// it) — it's reachable by URL for any order owner or admin, but orphaned in
// terms of frontend wiring. See the migration report.
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { getAuthOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/database/prisma";
import { generateInvoicePDF } from "@/lib/invoice";

export async function GET(_req, { params }) {
  const authOptions = await getAuthOptions();
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (order.userId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (!order.invoiceNumber) {
      return NextResponse.json({ error: "Invoice not generated yet" }, { status: 404 });
    }

    const pdfBytes = await generateInvoicePDF(order);

    return new NextResponse(pdfBytes, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=${order.invoiceNumber}.pdf`,
      },
    });
  } catch (err) {
    console.error("GET /api/orders/[id]/invoice error:", err);
    return NextResponse.json({ error: "Could not generate invoice." }, { status: 500 });
  }
}
