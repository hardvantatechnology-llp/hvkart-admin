"use server";

// Copied verbatim from hardvanta/src/app/admin/categories/actions.js — only
// import paths and the revalidatePath target (/admin/categories ->
// /dashboard/categories) changed.
import { revalidatePath, revalidateTag } from "next/cache";
import { prisma } from "@/lib/database/prisma";
import { getAdminSession } from "@/lib/auth/session";

function slugify(str) {
  return String(str || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
}

async function requireAdmin() {
  const session = await getAdminSession();
  if (!session) throw new Error("Forbidden");
}

export async function createCategory(formData) {
  await requireAdmin();
  const name = String(formData.get("name") || "").trim();
  if (!name) throw new Error("Category name is required.");
  const slug = slugify(name);
  if (!slug) throw new Error("Invalid category name.");

  await prisma.category.create({ data: { name, slug } });
  revalidatePath("/dashboard/categories");
  revalidateTag("categories");
}

export async function updateCategory(formData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  const name = String(formData.get("name") || "").trim();
  if (!id) throw new Error("Missing category id.");
  if (!name) throw new Error("Category name is required.");
  const slug = slugify(name);
  if (!slug) throw new Error("Invalid category name.");

  await prisma.category.update({ where: { id }, data: { name, slug } });
  revalidatePath("/dashboard/categories");
  revalidateTag("categories");
}

export async function toggleCategoryActive(id, active) {
  await requireAdmin();
  await prisma.category.update({ where: { id }, data: { active } });
  revalidatePath("/dashboard/categories");
  revalidateTag("categories");
}

export async function deleteCategory(id) {
  await requireAdmin();
  const inUse = await prisma.product.count({ where: { categoryId: id } });
  if (inUse > 0) {
    throw new Error(`Cannot delete — ${inUse} product(s) still use this category.`);
  }
  await prisma.category.delete({ where: { id } });
  revalidatePath("/dashboard/categories");
  revalidateTag("categories");
}
