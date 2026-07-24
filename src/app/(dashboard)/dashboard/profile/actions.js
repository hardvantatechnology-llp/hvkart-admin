"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/database/prisma";
import { getAdminSession } from "@/lib/auth/session";
import { logActivity } from "@/lib/activityLog";

export async function changeOwnPassword(formData) {
  const session = await getAdminSession();
  if (!session) throw new Error("Forbidden");

  const currentPassword = String(formData.get("currentPassword") || "");
  const newPassword = String(formData.get("newPassword") || "");
  if (!currentPassword || !newPassword) {
    throw new Error("Current and new password are required.");
  }
  if (newPassword.length < 8) {
    throw new Error("New password must be at least 8 characters.");
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user?.password) throw new Error("Account has no password set.");

  const valid = await bcrypt.compare(currentPassword, user.password);
  if (!valid) throw new Error("Current password is incorrect.");

  const hash = await bcrypt.hash(newPassword, 10);
  // Stamping passwordChangedAt invalidates any other already-issued session
  // on its next periodic re-check (see the jwt callback in
  // src/lib/auth/options.js) — same mechanism the reset-password flow uses.
  await prisma.user.update({
    where: { id: user.id },
    data: { password: hash, passwordChangedAt: new Date() },
  });

  await logActivity({ user, action: "PASSWORD_CHANGE", details: "Changed own password via Profile page" });
}
