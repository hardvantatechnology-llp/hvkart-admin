// Email sending via Resend.
// Adapted from hardvanta/src/lib/email.js — trimmed to only the functions the
// authentication flow needs (OTP login, password reset, welcome-on-signup).
// The `send()`/`getClient()` core and the two OTP-related templates are
// copied verbatim; order/enquiry/newsletter/contact templates belong to
// modules outside this phase and were intentionally left out.
//
// Setup: create an account at resend.com, verify a sending domain, add an
// API key, and set:
//   RESEND_API_KEY=...                              (your Resend API key)
//   EMAIL_FROM="Hardvanta Admin <noreply@yourdomain>" (must be on a verified domain)
//
// Until RESEND_API_KEY and EMAIL_FROM are both set, emails are logged to the
// server console instead of being sent — so OTP login still works in local
// development (read the code from the terminal).
import { Resend } from "resend";

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
    const { error } = await client.emails.send({ from, to, subject, html });
    if (error) {
      console.error("[email] send failed:", error.message || error);
      return { sent: false, error: error.message };
    }
    return { sent: true };
  } catch (err) {
    console.error("[email] send failed:", err?.message || err);
    return { sent: false, error: err?.message };
  }
}

export async function sendOtpEmail(to, code) {
  // Always log in dev so OTP login is testable without a configured sender.
  if (!process.env.RESEND_API_KEY) {
    console.log(`\n[email] OTP for ${to}: ${code}\n`);
  }
  return send({
    to,
    subject: `${code} is your hardvanta admin login code`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto">
        <h2 style="color:#0a1f44">Your login code</h2>
        <p style="color:#444">Use this code to finish signing in to the hardvanta admin panel. It expires in 10 minutes.</p>
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
    subject: `${code} is your hardvanta admin password reset code`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto">
        <h2 style="color:#0a1f44">Reset your password</h2>
        <p style="color:#444">Use this code to reset your hardvanta admin password. It expires in 10 minutes.</p>
        <p style="font-size:32px;font-weight:bold;letter-spacing:8px;color:#1e4fd8">${code}</p>
        <p style="color:#888;font-size:12px">If you didn't request this, you can safely ignore this email.</p>
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
        <p style="color:#444">Your hardvanta account now has admin access.</p>
        <p style="color:#888;font-size:12px">Questions? Just reply to this email — we're happy to help.</p>
      </div>`,
  });
}
