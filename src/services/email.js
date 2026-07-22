// Email sending via Resend.
//
// Setup: create an account at resend.com, verify a sending domain, add an
// API key, and set:
//   RESEND_API_KEY=...                              (your Resend API key)
//   EMAIL_FROM="Hardvanta <noreply@yourdomain>"      (must be on a verified domain)
//
// There is no fallback sender baked into this file — EMAIL_FROM must come
// from the environment. A hardcoded fallback here would silently send from
// an address nobody configured (e.g. Resend's sandbox domain) instead of
// failing loudly, which is worse: it looks like success in logs while the
// email either bounces or never reaches a real customer.
//
// Until RESEND_API_KEY and EMAIL_FROM are both set, emails are logged to the
// server console instead of being sent — so OTP login still works in local
// development (read the code from the terminal).
//
// Full verbatim re-copy from hardvanta/src/lib/email.js (previously trimmed
// to 3 auth-only functions in Phase 1 — restored in full for the Orders
// migration, since sendOrderShippedEmail/OutForDelivery/Delivered/Cancelled
// and sendRefundInitiatedEmail are needed here, and partial copies of this
// file already caused drift once).
import { Resend } from "resend";
import { formatPrice } from "@/utils/formatPrice";

function getClient() {
  const key = process.env.RESEND_API_KEY;
  return key ? new Resend(key) : null;
}

async function send({ to, subject, html }) {
  const client = getClient();
  const from = process.env.EMAIL_FROM;
  if (!client || !from) {
    // Dev fallback: no API key and/or no verified sender configured.
    console.log(
      `\n[email] (not sent — ${!client ? "RESEND_API_KEY" : "EMAIL_FROM"} missing)\n  to: ${to}\n  subject: ${subject}\n`
    );
    return { sent: false };
  }
  try {
    // The Resend SDK does NOT throw on API-level failures (bad/unverified
    // domain, sandbox recipient restrictions, etc.) — it resolves normally
    // with { data: null, error }. A try/catch alone can't see that, so it
    // must be checked explicitly or a failed send looks identical to a
    // successful one.
    const { data, error } = await client.emails.send({ from, to, subject, html });
    if (error) {
      console.error("[email] send failed:", error);
      return { sent: false, error: error.message || error };
    }
    return { sent: true, id: data?.id };
  } catch (err) {
    console.error("[email] send failed:", err);
    return { sent: false, error: err?.message || err };
  }
}

export async function sendOtpEmail(to, code) {
  // Always log in dev so OTP login is testable without a configured sender.
  if (!process.env.RESEND_API_KEY) {
    console.log(`\n[email] OTP for ${to}: ${code}\n`);
  }
  return send({
    to,
    subject: `${code} is your hardvanta login code`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto">
        <h2 style="color:#0a1f44">Your login code</h2>
        <p style="color:#444">Use this code to finish signing in to hardvanta. It expires in 10 minutes.</p>
        <p style="font-size:32px;font-weight:bold;letter-spacing:8px;color:#1e4fd8">${code}</p>
        <p style="color:#888;font-size:12px">If you didn't try to log in, you can ignore this email.</p>
      </div>`,
  });
}

export async function sendPasswordResetEmail(to, code) {
  // Always log in dev so reset is testable without a configured sender.
  if (!process.env.RESEND_API_KEY) {
    console.log(`\n[email] Password reset code for ${to}: ${code}\n`);
  }
  return send({
    to,
    subject: `${code} is your hardvanta password reset code`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto">
        <h2 style="color:#0a1f44">Reset your password</h2>
        <p style="color:#444">Use this code to reset your hardvanta password. It expires in 10 minutes.</p>
        <p style="font-size:32px;font-weight:bold;letter-spacing:8px;color:#1e4fd8">${code}</p>
        <p style="color:#888;font-size:12px">If you didn't request this, you can safely ignore this email.</p>
      </div>`,
  });
}

// Notifies the admin/sales inbox of a new enquiry from one of the bulk-order
// forms (B2B / Bulk Orders, Bulk Enquiry, ATL Kits Enquiry). Best-effort: the
// caller should never let a failure here roll back the already-saved enquiry.
export async function sendEnquiryAdminNotification({
  formType,
  id,
  name,
  company,
  email,
  phone,
  product,
  quantity,
  message,
}) {
  const to = process.env.ADMIN_NOTIFICATION_EMAIL;
  if (!to) {
    console.log(
      `\n[email] (not sent — ADMIN_NOTIFICATION_EMAIL missing)\n  new ${formType} enquiry ${id ? `#${id}` : ""} from ${name} <${email}>\n`
    );
    return { sent: false };
  }

  const row = (label, value) =>
    value
      ? `<tr><td style="padding:6px 10px;color:#888;font-size:13px;white-space:nowrap">${label}</td><td style="padding:6px 10px;color:#0a1f44;font-size:14px">${value}</td></tr>`
      : "";

  return send({
    to,
    subject: `New ${formType} enquiry from ${name}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto">
        <h2 style="color:#0a1f44">New ${formType} enquiry</h2>
        <table style="width:100%;border-collapse:collapse;margin:16px 0">
          ${row("Name", name)}
          ${row("Company / Institution", company)}
          ${row("Email", email)}
          ${row("Phone", phone)}
          ${row("Product", product)}
          ${row("Quantity", quantity)}
          ${row("Message", message)}
          ${row("Date &amp; Time", new Date().toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }))}
        </table>
        <p style="color:#888;font-size:12px">Reply directly to this email, or open the enquiry in the admin dashboard, to follow up.</p>
      </div>`,
  });
}

// Confirms receipt to the customer who submitted an enquiry.
export async function sendEnquiryConfirmationEmail({ to, name, formType }) {
  return send({
    to,
    subject: `We've received your ${formType} enquiry — hardvanta`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto">
        <h2 style="color:#0a1f44">Thank you, ${name || "there"}!</h2>
        <p style="color:#444">We've received your ${formType} enquiry. Our team will get back to you within 24–48 hours with pricing and availability.</p>
        <p style="color:#888;font-size:12px">If you have urgent requirements, feel free to reply to this email.</p>
      </div>`,
  });
}

export async function sendWelcomeEmail(to, name) {
  return send({
    to,
    subject: "Welcome to hardvanta!",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto">
        <h2 style="color:#0a1f44">Welcome, ${name || "there"}! 👋</h2>
        <p style="color:#444">Thanks for creating your hardvanta account. You're all set to browse electronics &amp; robotics kits, track orders, and save your favourites.</p>
        <p style="color:#888;font-size:12px">Questions? Just reply to this email — we're happy to help.</p>
      </div>`,
  });
}

export async function sendOrderShippedEmail(to, order) {
  const orderNumber = order.id.slice(-8).toUpperCase();
  const greeting = order.user?.name ? `Hi ${order.user.name},` : "Hi there,";

  const detailRow = (label, value) =>
    value
      ? `<tr><td style="padding:6px 10px;color:#888;font-size:13px;white-space:nowrap">${label}</td><td style="padding:6px 10px;color:#0a1f44;font-size:14px">${value}</td></tr>`
      : "";

  const estimatedDelivery = order.estimatedDeliveryAt
    ? new Date(order.estimatedDeliveryAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
    : null;

  const details = [
    detailRow("Courier", order.courierName),
    detailRow("Tracking number", order.trackingNumber),
    detailRow("Estimated delivery", estimatedDelivery),
  ].join("");

  return send({
    to,
    subject: `Your order #${orderNumber} has shipped`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto">
        <h2 style="color:#0a1f44">Your order is on its way! 📦</h2>
        <p style="color:#444">${greeting} order <strong>#${orderNumber}</strong> has been shipped and is heading to you.</p>
        ${details ? `<table style="width:100%;border-collapse:collapse;margin:16px 0">${details}</table>` : ""}
        <p style="color:#888;font-size:12px">You can track your order anytime under "My Orders" on hardvanta.</p>
      </div>`,
  });
}

export async function sendOrderOutForDeliveryEmail(to, order) {
  return send({
    to,
    subject: `Order #${order.id.slice(-8).toUpperCase()} is out for delivery`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto">
        <h2 style="color:#0a1f44">Out for delivery 🚚</h2>
        <p style="color:#444">Order <strong>#${order.id.slice(-8).toUpperCase()}</strong> is out for delivery and should arrive today.</p>
        <p style="color:#888;font-size:12px">You can track your order anytime under "My Orders" on hardvanta.</p>
      </div>`,
  });
}

export async function sendOrderDeliveredEmail(to, order) {
  return send({
    to,
    subject: `Order #${order.id.slice(-8).toUpperCase()} delivered`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto">
        <h2 style="color:#0a1f44">Delivered! 🎉</h2>
        <p style="color:#444">Order <strong>#${order.id.slice(-8).toUpperCase()}</strong> has been delivered. We hope you love it!</p>
        <p style="color:#888;font-size:12px">Facing an issue with your order? Reply to this email and we'll help.</p>
      </div>`,
  });
}

export async function sendOrderCancelledEmail(to, order) {
  return send({
    to,
    subject: `Order #${order.id.slice(-8).toUpperCase()} cancelled`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto">
        <h2 style="color:#0a1f44">Order cancelled</h2>
        <p style="color:#444">Order <strong>#${order.id.slice(-8).toUpperCase()}</strong> has been cancelled.</p>
        <p style="color:#888;font-size:12px">If you didn't request this or have any questions, reply to this email.</p>
      </div>`,
  });
}

export async function sendRefundInitiatedEmail(to, order) {
  return send({
    to,
    subject: `Refund initiated for order #${order.id.slice(-8).toUpperCase()}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto">
        <h2 style="color:#0a1f44">Refund initiated</h2>
        <p style="color:#444">We've initiated a refund of <strong>${formatPrice(order.total)}</strong> for order <strong>#${order.id.slice(-8).toUpperCase()}</strong>. It should reflect in your original payment method within 5-7 business days.</p>
        <p style="color:#888;font-size:12px">Questions about your refund? Reply to this email and we'll help.</p>
      </div>`,
  });
}

export async function sendContactConfirmationEmail({ to, name }) {
  return send({
    to,
    subject: "We've received your message — hardvanta",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto">
        <h2 style="color:#0a1f44">Thank you, ${name || "there"}!</h2>
        <p style="color:#444">We've received your message and our team will get back to you within 24–48 hours.</p>
        <p style="color:#888;font-size:12px">If you have urgent requirements, feel free to reply to this email.</p>
      </div>`,
  });
}

export async function sendNewsletterConfirmationEmail(to) {
  return send({
    to,
    subject: "You're subscribed to hardvanta updates",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto">
        <h2 style="color:#0a1f44">You're in! ✅</h2>
        <p style="color:#444">Thanks for subscribing to hardvanta's newsletter. We'll email you about new products, restocks, and offers.</p>
        <p style="color:#888;font-size:12px">Didn't sign up for this? You can safely ignore this email.</p>
      </div>`,
  });
}

export async function sendOrderConfirmationEmail(to, order) {
  const rows = (order.items || [])
    .map(
      (it) =>
        `<tr><td style="padding:6px 0;color:#444">${it.productName ?? it.name} × ${it.quantity}</td>
         <td style="padding:6px 0;text-align:right;color:#0a1f44">${formatPrice(it.price * it.quantity)}</td></tr>`
    )
    .join("");

  return send({
    to,
    subject: `Order confirmed — #${order.id.slice(-8).toUpperCase()}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto">
        <h2 style="color:#0a1f44">Thank you for your order! 🎉</h2>
        <p style="color:#444">Your order <strong>#${order.id.slice(-8).toUpperCase()}</strong> has been placed successfully.</p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0">
          ${rows}
          <tr><td style="padding:10px 0;border-top:1px solid #eee;font-weight:bold;color:#0a1f44">Total</td>
          <td style="padding:10px 0;border-top:1px solid #eee;text-align:right;font-weight:bold;color:#0a1f44">${formatPrice(order.total)}</td></tr>
        </table>
        <p style="color:#444">Payment: ${order.paymentMethod === "ONLINE" ? "Paid online" : "Cash on Delivery"}</p>
        <p style="color:#888;font-size:12px">You can track your order anytime under "My Orders" on hardvanta.</p>
      </div>`,
  });
}
