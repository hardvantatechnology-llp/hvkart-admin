// POST /api/auth/otp/request  { email, password }
// Step 1 of two-factor login: verify the password, then email a 6-digit code.
// Adapted from hardvanta/src/app/api/auth/otp/request/route.js — this admin
// panel is internal-only, so a valid password for a non-ADMIN account is
// rejected here (before a code is ever sent) instead of proceeding.
import { NextResponse } from "next/server";
import { randomInt } from "crypto";
import bcrypt from "bcryptjs";

import { sendOtpEmail } from "@/services/email";
import { checkRateLimit, getClientIp } from "@/lib/auth/rateLimit";

// Fixed dummy hash so bcrypt.compare always runs, even for unknown emails —
// keeps response time constant and avoids leaking which emails are registered.
const DUMMY_HASH = "$2a$10$CwTycUXWue0Thq9StjUM0uJ8n7t3T8n3Xs.3XkgKq7YbFvMRRZLXK";

export async function POST(request) {
  try {
    const { email, password } = await request.json();
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    const normalized = email.toLowerCase().trim();

    // Rate limit per-IP and per-email to slow down password guessing and
    // prevent email-bombing via repeated OTP requests.
    const ip = getClientIp(request);
    const byIp = checkRateLimit(`otp-request:ip:${ip}`, { limit: 20, windowMs: 15 * 60 * 1000 });
    const byEmail = checkRateLimit(`otp-request:email:${normalized}`, { limit: 5, windowMs: 15 * 60 * 1000 });
    if (!byIp.allowed || !byEmail.allowed) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }

    const { prisma } = await import("@/lib/database/prisma");
    const user = await prisma.user.findUnique({ where: { email: normalized } });

    // Verify credentials. Always run bcrypt.compare (against a dummy hash when
    // the account doesn't exist) so response time doesn't reveal which emails
    // are registered.
    const valid = await bcrypt.compare(password, user?.password || DUMMY_HASH);
    if (!user || !user.password || !valid) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    // This admin panel is internal-only — reject non-admin accounts here,
    // before a code is ever generated or emailed, so a valid password alone
    // never gets a non-admin any closer to a session. authorize() in
    // src/lib/auth/options.js enforces the same rule again at sign-in.
    if (user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Access denied. You are not authorized to access the admin panel." },
        { status: 403 }
      );
    }

    // Generate a 6-digit code valid for 10 minutes using a CSPRNG.
    const code = String(randomInt(100000, 1000000));
    const expires = new Date(Date.now() + 10 * 60 * 1000);

    // Replace any previous login codes for this email.
    await prisma.loginOtp.deleteMany({ where: { email: normalized, purpose: "LOGIN" } });
    await prisma.loginOtp.create({ data: { email: normalized, code, expires, purpose: "LOGIN" } });

    await sendOtpEmail(normalized, code);

    // Never return the code in the API response — even in local development,
    // read it from the server console (see src/services/email.js). Returning it
    // here would let anyone who knows a password retrieve the second factor
    // over the network, defeating 2FA the moment RESEND_API_KEY is unset/misconfigured.
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("POST /api/auth/otp/request error:", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
