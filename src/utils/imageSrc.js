// next/image requires an absolute URL (http/https) or a root-relative path
// starting with "/". Admin-entered values are sometimes a bare filename
// (e.g. "Raspberry Pi 3 Model B.png"), which crashes the page. This normalizes
// any value to something next/image accepts, falling back to a placeholder.
// Copied verbatim from hardvanta/src/utils/imageSrc.js.

const PLACEHOLDER = "/placeholder.svg";

export function imageSrc(value) {
  if (typeof value !== "string") return PLACEHOLDER;
  const v = value.trim();
  if (!v) return PLACEHOLDER;

  // Absolute URL: must be a *valid* http(s) URL (no spaces / real host),
  // otherwise next/image throws. e.g. "https://Raspberry Pi 3.png" is invalid.
  if (v.startsWith("http://") || v.startsWith("https://")) {
    try {
      const u = new URL(v);
      if (/\s/.test(v) || !u.hostname.includes(".")) return PLACEHOLDER;
      return v;
    } catch {
      return PLACEHOLDER;
    }
  }

  // Protocol-relative URL (e.g. "//cdn.example.com/img.png") — this also
  // starts with "/" but is an external URL, not a /public path. Normalize to
  // https and validate the same way as the absolute-URL branch above.
  if (v.startsWith("//")) {
    const candidate = `https:${v}`;
    try {
      const u = new URL(candidate);
      if (/\s/.test(v) || !u.hostname.includes(".")) return PLACEHOLDER;
      return candidate;
    } catch {
      return PLACEHOLDER;
    }
  }

  // Root-relative path served from /public.
  if (v.startsWith("/")) return v;

  return PLACEHOLDER;
}
