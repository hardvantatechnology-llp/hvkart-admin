// Server-side admin guard helpers — copied verbatim from hardvanta/src/lib/admin.js.
import { getServerSession } from "next-auth";
import { getAuthOptions } from "@/lib/auth/options";

// For Server Components / layouts: returns the session, or null if not admin.
export async function getAdminSession() {
  const authOptions = await getAuthOptions();
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") return null;
  return session;
}

// For API routes: returns true if the caller is an admin.
export async function isAdmin() {
  const authOptions = await getAuthOptions();
  const session = await getServerSession(authOptions);
  return session?.user?.role === "ADMIN";
}
