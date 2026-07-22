// POST /api/auth/reset-password/confirm  { email, code, password }
// Verifies the emailed code and sets a new password.
// Copied verbatim from hardvanta/src/app/api/auth/reset-password/confirm/route.js.
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { checkRateLimit, getClientIp } from "@/lib/auth/rateLimit";

export async function POST(request) {
  try {
    const { email, code, password } = await request.json();
    if (!email || !code || !password) {
      return NextResponse.json({ error: "All fields are required." }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
    }

    const normalized = email.toLowerCase().trim();

    // Rate limit code-guessing attempts per-email and per-IP.
    const ip = getClientIp(request);
    const byIp = checkRateLimit(`reset-confirm:ip:${ip}`, { limit: 20, windowMs: 15 * 60 * 1000 });
    const byEmail = checkRateLimit(`reset-confirm:email:${normalized}`, { limit: 10, windowMs: 15 * 60 * 1000 });
    if (!byIp.allowed || !byEmail.allowed) {
      return NextResponse.json({ error: "Too many attempts. Please try again later." }, { status: 429 });
    }

    const { prisma } = await import("@/lib/database/prisma");

    const otp = await prisma.loginOtp.findFirst({
      where: { email: normalized, code: String(code).trim(), purpose: "RESET" },
      orderBy: { createdAt: "desc" },
    });
    if (!otp || otp.expires < new Date()) {
      return NextResponse.json({ error: "Invalid or expired code." }, { status: 400 });
    }

    const hashed = await bcrypt.hash(password, 10);
    // Stamping passwordChangedAt lets any already-issued JWT session be
    // invalidated on its next periodic re-check (see the jwt callback in
    // src/lib/auth/options.js) instead of remaining valid for the rest of its lifetime.
    await prisma.user.update({
      where: { email: normalized },
      data: { password: hashed, passwordChangedAt: new Date() },
    });
    await prisma.loginOtp.deleteMany({ where: { email: normalized, purpose: "RESET" } });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("POST /api/auth/reset-password/confirm error:", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
