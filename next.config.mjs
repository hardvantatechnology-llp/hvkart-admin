import path from "node:path";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Pin the workspace root to this project — without it, Turbopack walks up
  // and finds an unrelated package-lock.json in the parent user directory
  // and infers the wrong root.
  turbopack: {
    root: path.resolve(import.meta.dirname),
  },
};

export default nextConfig;
