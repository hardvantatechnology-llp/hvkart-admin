// Central rules for keeping Order.status, its per-status timestamps, and the
// linked Payment.status in sync. Every code path that mutates order status
// (admin PATCH, Razorpay verify/webhook, cancel flow) goes through these
// helpers so the two never drift apart.
// Copied verbatim from hardvanta/src/lib/orderStatus.js.

export const ORDER_STATUSES = ["PENDING", "PROCESSING", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"];

export const STATUS_TIMESTAMP_FIELD = {
  PROCESSING: "processingAt",
  SHIPPED: "shippedAt",
  OUT_FOR_DELIVERY: "outForDeliveryAt",
  DELIVERED: "deliveredAt",
  CANCELLED: "cancelledAt",
};

// Builds the Order.update patch for a status transition: always sets
// `status`, and stamps the matching *At column with `now` — but only if it
// hasn't already been recorded, so a replayed transition never overwrites
// an earlier timestamp.
export function buildOrderStatusPatch(existingOrder, nextStatus, now = new Date()) {
  const data = { status: nextStatus };
  const field = STATUS_TIMESTAMP_FIELD[nextStatus];
  if (field && !existingOrder[field]) {
    data[field] = now;
  }
  return data;
}

// COD orders only get paid on delivery, so that's the one case where an
// order-status change must also flip the payment status. Online payments are
// already marked Paid by the gateway (verify/webhook) before delivery ever
// happens, so this must never re-touch a payment that's already decided.
export function buildPaymentSyncPatch(order, nextStatus, now = new Date()) {
  if (nextStatus !== "DELIVERED") return null;
  if (order.paymentMethod !== "COD") return null;
  if (!order.payment || order.payment.status !== "PENDING") return null;
  return { status: "SUCCESS", paidAt: order.payment.paidAt ?? now };
}

// A cancelled order that was never actually paid for (COD, or an online
// attempt that never completed) records the payment as Cancelled instead of
// leaving it stuck at Pending forever. A payment that was already captured
// is refunded instead (handled separately by the refund branch in cancelOrder).
export function buildPaymentCancelPatch(payment) {
  if (!payment || payment.status !== "PENDING") return null;
  return { status: "CANCELLED" };
}

export const PAYMENT_STATUS_META = {
  PENDING: { label: "Pending", className: "bg-amber-500/10 text-amber-300", border: "border-amber-500/20" },
  SUCCESS: { label: "Paid", className: "bg-cyan/10 text-cyan", border: "border-cyan/20" },
  FAILED: { label: "Failed", className: "bg-red-500/10 text-red-400", border: "border-red-500/20" },
  REFUNDED: { label: "Refunded", className: "bg-liquid/10 text-liquid-light", border: "border-liquid/20" },
  CANCELLED: { label: "Cancelled", className: "bg-white/10 text-white/50", border: "border-white/10" },
};

// Same statuses, styled for the storefront's light brand palette — /admin
// (dark theme) keeps using PAYMENT_STATUS_META above unchanged.
export const PAYMENT_STATUS_META_BRAND = {
  PENDING: { label: "Pending", className: "bg-amber-100 text-amber-700", border: "border-amber-300" },
  SUCCESS: { label: "Paid", className: "bg-brand-blue/10 text-brand-blue", border: "border-brand-blue/20" },
  FAILED: { label: "Failed", className: "bg-red-100 text-red-600", border: "border-red-300" },
  REFUNDED: { label: "Refunded", className: "bg-brand-steel/10 text-brand-steel", border: "border-brand-steel/20" },
  CANCELLED: { label: "Cancelled", className: "bg-brand-silver text-brand-muted", border: "border-brand-border" },
};
