// Shared `where`-clause builder for the admin Coupons list page and its
// export route, so "what you see" and "what you export" can never diverge.
// Copied verbatim from hardvanta/src/lib/couponFilters.js.

const FILTER_CLAUSES = {
  active: { active: true },
  inactive: { active: false },
  expired: { expiresAt: { lt: new Date() } },
  scheduled: { startsAt: { gt: new Date() } },
  percent: { type: "percent" },
  flat: { type: "flat" },
};

export function buildCouponWhere({ filter, q } = {}) {
  return {
    deletedAt: null,
    ...(FILTER_CLAUSES[filter] || {}),
    ...(q ? { code: { contains: q, mode: "insensitive" } } : {}),
  };
}
