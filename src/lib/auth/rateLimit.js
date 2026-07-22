// Minimal in-memory sliding-window rate limiter for the auth API routes.
// Copied verbatim from hardvanta/src/lib/rateLimit.js.
//
// NOTE: this state lives in a single Node process's memory. It resets on
// restart/redeploy and is NOT shared across multiple server instances or
// regions — on a horizontally-scaled deployment each instance enforces its
// own limit independently. That's an acceptable stopgap for now, but if
// this app ever runs more than one server instance, replace this with a
// shared store (e.g. Upstash Redis) behind the same `checkRateLimit()`
// signature so callers don't need to change.

const buckets = new Map();

// Opportunistically drop stale buckets so memory doesn't grow unbounded.
function prune(now) {
  for (const [key, entry] of buckets) {
    if (now - entry.start > entry.windowMs) buckets.delete(key);
  }
}

/**
 * Sliding-window-ish (fixed window) rate check. Each call increments the
 * counter for `key` and reports whether the caller is still under `limit`
 * requests within `windowMs`.
 *
 * @param {string} key unique bucket id, e.g. `otp-request:ip:1.2.3.4`
 * @param {{ limit: number, windowMs: number }} opts
 * @returns {{ allowed: boolean, remaining: number, retryAfterMs: number }}
 */
export function checkRateLimit(key, { limit, windowMs }) {
  const now = Date.now();
  if (buckets.size > 5000) prune(now);

  let entry = buckets.get(key);
  if (!entry || now - entry.start > windowMs) {
    entry = { start: now, count: 0, windowMs };
    buckets.set(key, entry);
  }
  entry.count += 1;

  const allowed = entry.count <= limit;
  return {
    allowed,
    remaining: Math.max(0, limit - entry.count),
    retryAfterMs: allowed ? 0 : entry.windowMs - (now - entry.start),
  };
}

// Best-effort client IP extraction behind a proxy/load balancer.
export function getClientIp(request) {
  const headers = request?.headers;
  if (!headers) return "unknown";
  const get = (name) => (typeof headers.get === "function" ? headers.get(name) : headers[name]);
  const fwd = get("x-forwarded-for");
  if (fwd) return String(fwd).split(",")[0].trim();
  return get("x-real-ip") || "unknown";
}
