// POST /api/upload — admin uploads one OR many image files, returns their URLs.
// Body: multipart/form-data with one or more "file" fields.
//
// Uses Supabase Storage when configured (best for production / shared use).
// Falls back to saving into /public/uploads locally so the upload button works
// out of the box in development without any Supabase setup.
// Copied verbatim from hardvanta/src/app/api/upload/route.js — only the
// import path for the admin guard changed (@/lib/admin -> @/lib/auth/session).
import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { isAdmin } from "@/lib/auth/session";
import { getSupabaseAdmin, PRODUCT_BUCKET } from "@/lib/supabase";

// Fixed allowlist of accepted image MIME types → file extension. SVG is
// deliberately excluded since it can embed executable script content.
const ALLOWED_TYPES = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

// Verify the file's actual magic bytes match the declared/allowed type,
// since the browser-supplied `file.type` can be spoofed by the client.
function matchesSignature(bytes, ext) {
  const b = (i) => bytes[i];
  switch (ext) {
    case "jpg":
      return b(0) === 0xff && b(1) === 0xd8 && b(2) === 0xff;
    case "png":
      return (
        b(0) === 0x89 && b(1) === 0x50 && b(2) === 0x4e && b(3) === 0x47 &&
        b(4) === 0x0d && b(5) === 0x0a && b(6) === 0x1a && b(7) === 0x0a
      );
    case "gif":
      return b(0) === 0x47 && b(1) === 0x49 && b(2) === 0x46 && b(3) === 0x38;
    case "webp":
      return (
        b(0) === 0x52 && b(1) === 0x49 && b(2) === 0x46 && b(3) === 0x46 &&
        b(8) === 0x57 && b(9) === 0x45 && b(10) === 0x42 && b(11) === 0x50
      );
    default:
      return false;
  }
}

async function saveOne(file, supabase) {
  const ext = ALLOWED_TYPES[file.type?.toLowerCase()];
  if (!ext) {
    throw new Error("Only JPG, PNG, WEBP, or GIF images are allowed.");
  }
  if (file.size > 5 * 1024 * 1024) {
    throw new Error("Each image must be under 5MB.");
  }
  const arrayBuffer = await file.arrayBuffer();
  const header = new Uint8Array(arrayBuffer.slice(0, 12));
  if (!matchesSignature(header, ext)) {
    throw new Error("File content does not match a valid image format.");
  }
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  if (supabase) {
    const { error } = await supabase.storage
      .from(PRODUCT_BUCKET)
      .upload(filename, arrayBuffer, { contentType: file.type, upsert: false });
    if (error) throw new Error(error.message);
    const { data } = supabase.storage.from(PRODUCT_BUCKET).getPublicUrl(filename);
    return data.publicUrl;
  }

  // Local fallback → /public/uploads
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });
  await writeFile(path.join(uploadDir, filename), Buffer.from(arrayBuffer));
  return `/uploads/${filename}`;
}

export async function POST(request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const formData = await request.formData();
  const files = formData.getAll("file").filter((f) => f && typeof f !== "string");
  if (files.length === 0) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  try {
    const urls = [];
    for (const file of files) {
      urls.push(await saveOne(file, supabase));
    }
    // `url` kept for backward compatibility with single-file callers.
    return NextResponse.json({ urls, url: urls[0] });
  } catch (err) {
    return NextResponse.json(
      { error: `Upload failed: ${err?.message || "unknown error"}` },
      { status: 500 }
    );
  }
}
