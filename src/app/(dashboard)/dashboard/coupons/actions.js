"use server";

// Copied verbatim from hardvanta/src/app/admin/coupons/actions.js — only
// import paths and the revalidatePath target (/admin/coupons ->
// /dashboard/coupons) changed.
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/database/prisma";
import { getAdminSession } from "@/lib/auth/session";
import { parseCouponFormFields } from "@/lib/couponValidation";

async function requireAdmin() {
  const session = await getAdminSession();
  if (!session) throw new Error("Forbidden");
}

export async function createCoupon(formData) {
  await requireAdmin();
  const data = parseCouponFormFields(formData);

  try {
    await prisma.coupon.create({ data });
  } catch (err) {
    if (err.code === "P2002") {
      throw new Error("A coupon with this code already exists.");
    }
    throw err;
  }
  revalidatePath("/dashboard/coupons");
}

export async function updateCoupon(formData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  if (!id) throw new Error("Missing coupon id.");
  const data = parseCouponFormFields(formData);

  try {
    await prisma.coupon.update({ where: { id }, data });
  } catch (err) {
    if (err.code === "P2002") {
      throw new Error("A coupon with this code already exists.");
    }
    throw err;
  }
  revalidatePath("/dashboard/coupons");
}

export async function toggleCouponActive(id, active) {
  await requireAdmin();
  await prisma.coupon.update({ where: { id }, data: { active } });
  revalidatePath("/dashboard/coupons");
}

export async function deleteCoupon(id) {
  await requireAdmin();
  // Always soft-delete — coupons may already be referenced by past orders
  // (Order.couponCode), so a real DELETE is never performed. Also flips
  // `active` off so it's hidden everywhere immediately, not just filtered
  // out of default list queries.
  await prisma.coupon.update({ where: { id }, data: { deletedAt: new Date(), active: false } });
  revalidatePath("/dashboard/coupons");
}
