"use server";

// Copied verbatim from hardvanta/src/app/admin/brands/actions.js — only
// import paths and the revalidatePath target (/admin/brands ->
// /dashboard/brands) changed.
import { revalidatePath, revalidateTag } from "next/cache";
import { prisma } from "@/lib/database/prisma";
import { getAdminSession } from "@/lib/auth/session";

function slugify(str) {
  return String(str || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function requireAdmin() {
  const session = await getAdminSession();
  if (!session) throw new Error("Forbidden");
}

export async function createBrand(formData) {
  await requireAdmin();
  const name = String(formData.get("name") || "").trim();
  if (!name) throw new Error("Brand name is required.");
  const slug = slugify(name);
  if (!slug) throw new Error("Invalid brand name.");

  await prisma.brand.create({ data: { name, slug } });
  revalidatePath("/dashboard/brands");
  revalidateTag("products");
}

export async function updateBrand(formData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  const name = String(formData.get("name") || "").trim();
  if (!id) throw new Error("Missing brand id.");
  if (!name) throw new Error("Brand name is required.");
  const slug = slugify(name);
  if (!slug) throw new Error("Invalid brand name.");

  await prisma.brand.update({ where: { id }, data: { name, slug } });
  revalidatePath("/dashboard/brands");
  revalidateTag("products");
}

export async function toggleBrandActive(id, active) {
  await requireAdmin();
  await prisma.brand.update({ where: { id }, data: { active } });
  revalidatePath("/dashboard/brands");
}

export async function deleteBrand(id) {
  await requireAdmin();
  const inUse = await prisma.product.count({ where: { brandId: id } });
  if (inUse > 0) {
    throw new Error(`Cannot delete — ${inUse} product(s) still use this brand.`);
  }
  await prisma.brand.delete({ where: { id } });
  revalidatePath("/dashboard/brands");
}
