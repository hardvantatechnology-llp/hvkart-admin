"use server";

// Copied verbatim from hardvanta/src/app/admin/coupons/actions.js — only
// import paths and the revalidatePath target (/admin/coupons ->
// /dashboard/coupons) changed.
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/database/prisma";
import { getAdminSession } from "@/lib/auth/session";
import { parseCouponFormFields } from "@/lib/couponValidation";
import { logActivity } from "@/lib/activityLog";

async function requireAdmin() {
  const session = await getAdminSession();
  if (!session) throw new Error("Forbidden");
  return session;
}

export async function createCoupon(formData) {
  const session = await requireAdmin();
  const data = parseCouponFormFields(formData);

  let coupon;
  try {
    coupon = await prisma.coupon.create({ data });
  } catch (err) {
    if (err.code === "P2002") {
      throw new Error("A coupon with this code already exists.");
    }
    throw err;
  }
  await logActivity({ user: session.user, action: "COUPON_CREATE", details: `Created coupon ${coupon.code}` });
  revalidatePath("/dashboard/coupons");
}

export async function updateCoupon(formData) {
  const session = await requireAdmin();
  const id = String(formData.get("id") || "");
  if (!id) throw new Error("Missing coupon id.");
  const data = parseCouponFormFields(formData);

  let coupon;
  try {
    coupon = await prisma.coupon.update({ where: { id }, data });
  } catch (err) {
    if (err.code === "P2002") {
      throw new Error("A coupon with this code already exists.");
    }
    throw err;
  }
  await logActivity({ user: session.user, action: "COUPON_UPDATE", details: `Updated coupon ${coupon.code}` });
  revalidatePath("/dashboard/coupons");
}

export async function toggleCouponActive(id, active) {
  const session = await requireAdmin();
  const coupon = await prisma.coupon.update({ where: { id }, data: { active } });
  await logActivity({
    user: session.user,
    action: active ? "COUPON_ENABLE" : "COUPON_DISABLE",
    details: `${active ? "Enabled" : "Disabled"} coupon ${coupon.code}`,
  });
  revalidatePath("/dashboard/coupons");
}

export async function deleteCoupon(id) {
  const session = await requireAdmin();
  // Always soft-delete — coupons may already be referenced by past orders
  // (Order.couponCode), so a real DELETE is never performed. Also flips
  // `active` off so it's hidden everywhere immediately, not just filtered
  // out of default list queries.
  const coupon = await prisma.coupon.update({ where: { id }, data: { deletedAt: new Date(), active: false } });
  await logActivity({ user: session.user, action: "COUPON_DELETE", details: `Deleted coupon ${coupon.code}` });
  revalidatePath("/dashboard/coupons");
}
