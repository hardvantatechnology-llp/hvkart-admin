// Next.js 16 renamed the `middleware` file convention to `proxy` (same
// mechanism, new name/location requirement — see
// node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md).
// This runs on every matched request before rendering, gating /dashboard by
// NextAuth session + ADMIN role, same as hardvanta's src/middleware.js gates
// /admin.
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { resolveAdminGate } from "@/middleware/adminGate";

export async function proxy(req) {
  const { pathname } = req.nextUrl;
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  const decision = resolveAdminGate({ pathname, token });

  if (decision.redirect) {
    const url = new URL(decision.redirect, req.url);
    if (decision.withCallback) url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login"],
};
