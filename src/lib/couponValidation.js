// Pure validation for the admin coupon create/edit form — no Next.js/DB/auth
// dependencies, so it's usable both from the "use server" actions file and
// directly in tests.
// Copied verbatim from hardvanta/src/lib/couponValidation.js.

export function parseDate(value) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) throw new Error("Invalid date.");
  return d;
}

export function parseCouponFormFields(formData) {
  const code = String(formData.get("code") || "").trim().toUpperCase();
  const description = String(formData.get("description") || "").trim() || null;
  const type = formData.get("type") === "percent" ? "percent" : "flat";
  const discount = Number(formData.get("discount"));
  const minOrder = Number(formData.get("minOrder") || 0);
  const maxDiscountRaw = formData.get("maxDiscount");
  const maxDiscount = maxDiscountRaw ? Number(maxDiscountRaw) : null;
  const usageLimitRaw = formData.get("usageLimit");
  const usageLimit = usageLimitRaw ? Number(usageLimitRaw) : null;
  const startsAt = parseDate(formData.get("startsAt"));
  const expiresAt = parseDate(formData.get("expiresAt"));
  const active = formData.get("active") === "on" || formData.get("active") === "true";

  if (!code) throw new Error("Coupon code is required.");
  if (!/^[A-Z0-9_-]{3,30}$/.test(code)) {
    throw new Error("Coupon code must be 3-30 characters (letters, numbers, - or _ only).");
  }
  if (!Number.isFinite(discount) || discount <= 0) {
    throw new Error("Discount must be a positive number.");
  }
  if (type === "percent" && discount > 100) {
    throw new Error("Percentage discount cannot exceed 100.");
  }
  if (!Number.isFinite(minOrder) || minOrder < 0) {
    throw new Error("Minimum order value cannot be negative.");
  }
  if (maxDiscount != null && (!Number.isFinite(maxDiscount) || maxDiscount <= 0)) {
    throw new Error("Maximum discount must be a positive number.");
  }
  if (usageLimit != null && (!Number.isInteger(usageLimit) || usageLimit <= 0)) {
    throw new Error("Usage limit must be a positive whole number.");
  }
  if (startsAt && expiresAt && expiresAt <= startsAt) {
    throw new Error("Expiry date must be after the start date.");
  }

  return { code, description, type, discount, minOrder, maxDiscount, usageLimit, startsAt, expiresAt, active };
}
