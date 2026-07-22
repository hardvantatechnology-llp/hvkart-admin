// POST /api/auth/reset-password/request  { email }
// Emails a 6-digit reset code (reuses the LoginOtp table, scoped to the RESET
// purpose). Always returns a generic success so we don't reveal which emails
// have accounts.
// Copied verbatim from hardvanta/src/app/api/auth/reset-password/request/route.js.
import { NextResponse } from "next/server";
import { randomInt } from "crypto";
import { sendPasswordResetEmail } from "@/services/email";
import { checkRateLimit, getClientIp } from "@/lib/auth/rateLimit";

export async function POST(request) {
  try {
    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }
    const normalized = email.toLowerCase().trim();

    // Rate limit per-IP and per-email — this endpoint requires no auth at all,
    // so without a limit it can be used to email-bomb a victim or to grind
    // through OTP guesses.
    const ip = getClientIp(request);
    const byIp = checkRateLimit(`reset-request:ip:${ip}`, { limit: 20, windowMs: 15 * 60 * 1000 });
    const byEmail = checkRateLimit(`reset-request:email:${normalized}`, { limit: 5, windowMs: 15 * 60 * 1000 });
    if (!byIp.allowed || !byEmail.allowed) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }

    const { prisma } = await import("@/lib/database/prisma");
    const user = await prisma.user.findUnique({ where: { email: normalized } });

    // Only send a code if the account exists and uses a password.
    if (user?.password) {
      const code = String(randomInt(100000, 1000000));
      const expires = new Date(Date.now() + 10 * 60 * 1000);
      // Scoped to purpose: RESET so this never collides with / invalidates a
      // login OTP the same user may have just requested.
      await prisma.loginOtp.deleteMany({ where: { email: normalized, purpose: "RESET" } });
      await prisma.loginOtp.create({ data: { email: normalized, code, expires, purpose: "RESET" } });

      await sendPasswordResetEmail(normalized, code);
    }

    // Same response shape whether or not the account exists, and the code is
    // never included in the response — only ever delivered via email (or the
    // server console in local dev, see src/services/email.js).
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("POST /api/auth/reset-password/request error:", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
