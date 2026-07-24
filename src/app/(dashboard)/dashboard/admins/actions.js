"use server";

// New file — no Hardvanta equivalent (Admin Users management is a
// hvkart-admin-only feature). Follows the same Server Action conventions as
// dashboard/coupons/actions.js (requireAdmin guard, revalidatePath) and
// dashboard/profile/actions.js (bcrypt cost 10, passwordChangedAt stamping,
// logActivity best-effort calls).
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/database/prisma";
import { getAdminSession } from "@/lib/auth/session";
import { logActivity } from "@/lib/activityLog";

async function requireAdmin() {
  const session = await getAdminSession();
  if (!session) throw new Error("Forbidden");
  return session;
}

export async function createAdmin(formData) {
  const session = await requireAdmin();
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");

  if (!name || !email || !password) throw new Error("Name, email and password are required.");
  if (password.length < 8) throw new Error("Password must be at least 8 characters.");

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new Error("A user with this email already exists.");

  const hash = await bcrypt.hash(password, 10);
  const admin = await prisma.user.create({
    data: { name, email, password: hash, role: "ADMIN", isActive: true },
  });

  await logActivity({ user: session.user, action: "ADMIN_CREATE", details: `Created admin ${admin.email}` });
  revalidatePath("/dashboard/admins");
}

export async function updateAdmin(formData) {
  const session = await requireAdmin();
  const id = String(formData.get("id") || "");
  if (!id) throw new Error("Missing admin id.");

  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  if (!name || !email) throw new Error("Name and email are required.");

  const existing = await prisma.user.findFirst({ where: { email, NOT: { id } } });
  if (existing) throw new Error("A user with this email already exists.");

  await prisma.user.update({ where: { id }, data: { name, email } });
  await logActivity({ user: session.user, action: "ADMIN_UPDATE", details: `Updated admin ${email}` });
  revalidatePath("/dashboard/admins");
}

export async function toggleAdminActive(id, active) {
  const session = await requireAdmin();
  if (id === session.user.id && !active) {
    throw new Error("You cannot disable your own account.");
  }

  const admin = await prisma.user.update({ where: { id }, data: { isActive: active } });
  await logActivity({
    user: session.user,
    action: active ? "ADMIN_ENABLE" : "ADMIN_DISABLE",
    details: `${active ? "Enabled" : "Disabled"} admin ${admin.email}`,
  });
  revalidatePath("/dashboard/admins");
}

export async function deleteAdmin(id) {
  const session = await requireAdmin();
  if (id === session.user.id) throw new Error("You cannot delete your own account.");

  let admin;
  try {
    admin = await prisma.user.delete({ where: { id } });
  } catch (err) {
    if (err.code === "P2003") {
      throw new Error("This admin has related records and cannot be deleted. Disable the account instead.");
    }
    throw err;
  }
  await logActivity({ user: session.user, action: "ADMIN_DELETE", details: `Deleted admin ${admin.email}` });
  revalidatePath("/dashboard/admins");
}

export async function resetAdminPassword(formData) {
  const session = await requireAdmin();
  const id = String(formData.get("id") || "");
  const newPassword = String(formData.get("newPassword") || "");
  if (!id) throw new Error("Missing admin id.");
  if (newPassword.length < 8) throw new Error("New password must be at least 8 characters.");

  const hash = await bcrypt.hash(newPassword, 10);
  // Stamping passwordChangedAt invalidates any already-issued session for
  // this admin on its next periodic re-check — same mechanism as
  // dashboard/profile/actions.js's changeOwnPassword.
  const admin = await prisma.user.update({
    where: { id },
    data: { password: hash, passwordChangedAt: new Date() },
  });
  await logActivity({ user: session.user, action: "ADMIN_PASSWORD_RESET", details: `Reset password for admin ${admin.email}` });
  revalidatePath("/dashboard/admins");
}
