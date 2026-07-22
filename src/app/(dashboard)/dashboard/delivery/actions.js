"use server";

// Copied verbatim from hardvanta/src/app/admin/delivery/actions.js — only
// import paths and revalidatePath targets (/admin/delivery/* ->
// /dashboard/delivery/*) changed.
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/database/prisma";
import { getAdminSession } from "@/lib/auth/session";
import { SETTINGS_ID } from "@/lib/delivery";

async function requireAdmin() {
  const session = await getAdminSession();
  if (!session) throw new Error("Forbidden");
}

function slugify(str) {
  return String(str)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
}

// ---------- Delivery Areas ----------

export async function createDeliveryArea(formData) {
  await requireAdmin();
  const name = String(formData.get("name") || "").trim();
  if (!name) throw new Error("City name is required.");
  try {
    await prisma.deliveryArea.create({ data: { name, slug: slugify(name) } });
  } catch (err) {
    if (err.code === "P2002") throw new Error("A delivery area with this name already exists.");
    throw err;
  }
  revalidatePath("/dashboard/delivery/areas");
}

export async function toggleDeliveryAreaActive(id, active) {
  await requireAdmin();
  await prisma.deliveryArea.update({ where: { id }, data: { active } });
  revalidatePath("/dashboard/delivery/areas");
}

export async function deleteDeliveryArea(id) {
  await requireAdmin();
  // Cascades to its Pincode rows (onDelete: Cascade in schema).
  await prisma.deliveryArea.delete({ where: { id } });
  revalidatePath("/dashboard/delivery/areas");
  revalidatePath("/dashboard/delivery/pincodes");
}

// ---------- Pincodes ----------

export async function createPincode(formData) {
  await requireAdmin();
  const code = String(formData.get("code") || "").trim();
  const areaLabel = String(formData.get("areaLabel") || "").trim();
  const deliveryAreaId = String(formData.get("deliveryAreaId") || "");
  if (!/^[1-9][0-9]{5}$/.test(code)) throw new Error("Enter a valid 6-digit pincode.");
  if (!areaLabel) throw new Error("Locality label is required.");
  if (!deliveryAreaId) throw new Error("Select a delivery area.");

  try {
    await prisma.pincode.create({
      data: {
        code,
        areaLabel,
        deliveryAreaId,
        codAvailable: formData.get("codAvailable") === "on",
        expressAvailable: formData.get("expressAvailable") === "on",
      },
    });
  } catch (err) {
    if (err.code === "P2002") throw new Error("This pincode already exists.");
    throw err;
  }
  revalidatePath("/dashboard/delivery/pincodes");
}

export async function updatePincode(formData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  if (!id) throw new Error("Missing pincode id.");
  const areaLabel = String(formData.get("areaLabel") || "").trim();
  const deliveryAreaId = String(formData.get("deliveryAreaId") || "");
  if (!areaLabel) throw new Error("Locality label is required.");
  if (!deliveryAreaId) throw new Error("Select a delivery area.");

  await prisma.pincode.update({
    where: { id },
    data: {
      areaLabel,
      deliveryAreaId,
      codAvailable: formData.get("codAvailable") === "on",
      expressAvailable: formData.get("expressAvailable") === "on",
    },
  });
  revalidatePath("/dashboard/delivery/pincodes");
}

export async function togglePincodeActive(id, active) {
  await requireAdmin();
  await prisma.pincode.update({ where: { id }, data: { active } });
  revalidatePath("/dashboard/delivery/pincodes");
}

export async function deletePincode(id) {
  await requireAdmin();
  await prisma.pincode.delete({ where: { id } });
  revalidatePath("/dashboard/delivery/pincodes");
}

// ---------- Delivery Settings (singleton) ----------

export async function updateDeliverySettings(formData) {
  await requireAdmin();
  const cutoffTime = String(formData.get("cutoffTime") || "14:00");
  const standardDeliveryDaysToAdd = Math.max(0, parseInt(formData.get("standardDeliveryDaysToAdd"), 10) || 0);
  const freeShippingThreshold = Math.max(0, parseInt(formData.get("freeShippingThreshold"), 10) || 0);
  const deliveryCharge = Math.max(0, parseInt(formData.get("deliveryCharge"), 10) || 0);
  const codEnabled = formData.get("codEnabled") === "on";
  const expressEnabled = formData.get("expressEnabled") === "on";

  const data = { cutoffTime, standardDeliveryDaysToAdd, freeShippingThreshold, deliveryCharge, codEnabled, expressEnabled };
  await prisma.deliverySettings.upsert({ where: { id: SETTINGS_ID }, update: data, create: { id: SETTINGS_ID, ...data } });
  revalidatePath("/dashboard/delivery/settings");
}

// ---------- Holidays ----------

export async function createHoliday(formData) {
  await requireAdmin();
  const dateStr = String(formData.get("date") || "");
  const reason = String(formData.get("reason") || "").trim() || null;
  if (!dateStr) throw new Error("Date is required.");

  try {
    await prisma.holiday.create({ data: { date: new Date(dateStr), reason } });
  } catch (err) {
    if (err.code === "P2002") throw new Error("A holiday for this date already exists.");
    throw err;
  }
  revalidatePath("/dashboard/delivery/holidays");
}

export async function deleteHoliday(id) {
  await requireAdmin();
  await prisma.holiday.delete({ where: { id } });
  revalidatePath("/dashboard/delivery/holidays");
}
