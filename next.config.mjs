import path from "node:path";

// Derive the Supabase storage hostname from the configured project URL so we
// don't hardcode a project ref here — matches hardvanta/next.config.mjs's
// same derivation, needed because product images are served from Supabase
// Storage and next/image requires the hostname to be explicitly allowlisted.
const supabaseHostname = (() => {
  try {
    return process.env.NEXT_PUBLIC_SUPABASE_URL
      ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
      : null;
  } catch {
    return null;
  }
})();

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Pin the workspace root to this project — without it, Turbopack walks up
  // and finds an unrelated package-lock.json in the parent user directory
  // and infers the wrong root.
  turbopack: {
    root: path.resolve(import.meta.dirname),
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      ...(supabaseHostname
        ? [
            {
              protocol: "https",
              hostname: supabaseHostname,
              pathname: "/storage/v1/object/public/**",
            },
          ]
        : []),
    ],
  },
};

export default nextConfig;
