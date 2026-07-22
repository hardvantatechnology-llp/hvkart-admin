// PATCH /api/orders/[id] — update order status (admin only).
// Copied verbatim from hardvanta/src/app/api/orders/[id]/route.js — import
// paths updated, and `params` is now awaited (Promise in Next.js 16, was a
// plain object in hardvanta's Next 14). Includes hardvanta's current
// uncommitted trackingNumber/courierName/estimatedDeliveryAt support (see
// MIGRATION_LOG.md — applied as part of this Orders migration).
import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth/session";
import { prisma } from "@/lib/database/prisma";
import { cancelOrder } from "@/app/api/orders/_cancel";
import { buildOrderStatusPatch, buildPaymentSyncPatch } from "@/lib/orderStatus";
import {
  sendOrderShippedEmail,
  sendOrderOutForDeliveryEmail,
  sendOrderDeliveredEmail,
} from "@/services/email";

const VALID = ["PENDING", "PROCESSING", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"];

// Explicit allowed forward transitions: no jumping backwards out of a
// terminal state, and no skipping straight from PENDING to DELIVERED.
const ALLOWED_TRANSITIONS = {
  PENDING: ["PROCESSING", "SHIPPED", "CANCELLED"],
  PROCESSING: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["OUT_FOR_DELIVERY", "DELIVERED"],
  OUT_FOR_DELIVERY: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
};

const STATUS_EMAIL_SENDERS = {
  SHIPPED: sendOrderShippedEmail,
  OUT_FOR_DELIVERY: sendOrderOutForDeliveryEmail,
  DELIVERED: sendOrderDeliveredEmail,
};

export async function PATCH(request, { params }) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await params;
  try {
    const { status, trackingNumber, courierName, estimatedDeliveryAt } = await request.json();
    if (!VALID.includes(status)) {
      return NextResponse.json({ error: "Invalid status." }, { status: 400 });
    }

    const existing = await prisma.order.findUnique({
      where: { id },
      include: { items: true, payment: true, user: { select: { email: true, name: true } } },
    });
    if (!existing) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    if (existing.status === status) {
      return NextResponse.json({ order: existing });
    }

    // Admins can force-cancel from any status (not just the customer-facing
    // CANCELLABLE_STATUSES), so CANCELLED skips the normal transition map.
    if (status !== "CANCELLED" && !ALLOWED_TRANSITIONS[existing.status]?.includes(status)) {
      return NextResponse.json(
        { error: `Cannot change order from ${existing.status} to ${status}.` },
        { status: 400 }
      );
    }

    // Cancelling through the admin route must restore stock (and refund online
    // payments) exactly like the customer-facing cancel endpoint does.
    if (status === "CANCELLED") {
      const result = await cancelOrder(existing, { force: true }).catch((err) => {
        console.error("[orders/[id] PATCH] cancel failed:", err?.message || err);
        return { ok: false, reason: "error" };
      });
      if (!result.ok) {
        return NextResponse.json(
          { error: "This order could not be cancelled." },
          { status: 409 }
        );
      }
      const order = await prisma.order.findUnique({ where: { id }, include: { payment: true } });
      return NextResponse.json({ order });
    }

    const orderPatch = buildOrderStatusPatch(existing, status);
    const paymentPatch = buildPaymentSyncPatch(existing, status);

    // Shipping details are optional and only ever relevant on the SHIPPED
    // transition — accepted here (not just from the admin UI) so any other
    // backend workflow that ships an order can pass them through the same
    // endpoint without a frontend change.
    if (status === "SHIPPED") {
      if (typeof trackingNumber === "string" && trackingNumber.trim()) {
        orderPatch.trackingNumber = trackingNumber.trim();
      }
      if (typeof courierName === "string" && courierName.trim()) {
        orderPatch.courierName = courierName.trim();
      }
      if (estimatedDeliveryAt) {
        const parsed = new Date(estimatedDeliveryAt);
        if (!Number.isNaN(parsed.getTime())) {
          orderPatch.estimatedDeliveryAt = parsed;
        }
      }
    }

    const order = await prisma
      .$transaction(async (tx) => {
        await tx.order.update({ where: { id }, data: orderPatch });
        if (paymentPatch) {
          await tx.payment.update({ where: { orderId: id }, data: paymentPatch });
        }
        return tx.order.findUnique({
          where: { id },
          include: { payment: true, user: { select: { email: true, name: true } } },
        });
      })
      .catch(() => null);
    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    // Best-effort — a failed status-update email must never fail the
    // already-committed status change. Only fires on an actual transition
    // into this status (the existing.status === status check above already
    // returned early for a no-op update), so a repeat PATCH with the same
    // status — or any update that doesn't change status — never re-sends it.
    const sendStatusEmail = STATUS_EMAIL_SENDERS[status];
    if (sendStatusEmail) {
      if (!order.user?.email) {
        console.warn(`[orders/[id] PATCH] ${status} email skipped — order ${order.id} has no user email on file.`);
      } else {
        console.log(`[orders/[id] PATCH] Triggering ${status} email to ${order.user.email} for order ${order.id}`);
        try {
          const result = await sendStatusEmail(order.user.email, order);
          if (result?.sent) {
            console.log(`[orders/[id] PATCH] ${status} email sent — Resend message id: ${result.id}`);
          } else {
            console.error(`[orders/[id] PATCH] ${status} email not sent:`, result?.error || result);
          }
        } catch (err) {
          console.error(`[orders/[id] PATCH] ${status} email failed:`, err);
        }
      }
    }

    return NextResponse.json({ order });
  } catch (err) {
    console.error("PATCH /api/orders/[id] error:", err);
    return NextResponse.json({ error: "Could not update order." }, { status: 500 });
  }
}
