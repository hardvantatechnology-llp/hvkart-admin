"use server";

// Copied verbatim from hardvanta/src/app/admin/reviews/actions.js — only
// import paths and the revalidatePath target (/admin/reviews ->
// /dashboard/reviews) changed.
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/database/prisma";
import { getAdminSession } from "@/lib/auth/session";

export async function deleteReview(id) {
  const session = await getAdminSession();
  if (!session) throw new Error("Forbidden");
  if (!id) throw new Error("Missing review id.");

  await prisma.review.delete({ where: { id } }).catch(() => {
    throw new Error("Review not found or already deleted.");
  });

  revalidatePath("/dashboard/reviews");
}
