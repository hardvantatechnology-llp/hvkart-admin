"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import Button from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

// Adapted from hardvanta/src/components/admin/BlogForm.jsx — only the two
// post-save/cancel navigation targets changed (/admin/blogs ->
// /dashboard/blogs). All fields, validation, and API calls are unchanged.
function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

const inputCls = "admin-input";

export default function BlogForm({ initial }) {
  const router = useRouter();
  const toast = useToast();
  const isEdit = Boolean(initial?.id);

  const [form, setForm] = useState({
    title: initial?.title || "",
    slug: initial?.slug || "",
    excerpt: initial?.excerpt || "",
    content: initial?.content || "",
    coverImage: initial?.coverImage || "",
    category: initial?.category || "General",
    author: initial?.author || "Hardvanta Team",
    published: initial?.published ?? true,
  });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function update(field, value) {
    setForm((f) => {
      const next = { ...f, [field]: value };
      // Auto-generate slug from title only if user hasn't edited it manually (new blogs only).
      if (field === "title" && !isEdit) {
        next.slug = slugify(value);
      }
      return next;
    });
  }

  async function handleImageUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Upload failed.");
      update("coverImage", data.url);
    } catch (err) {
      setError(err?.message || "Could not upload image.");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const url = isEdit ? `/api/blogs/${initial.id}` : "/api/blogs";
      const method = isEdit ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Could not save blog.");
      toast.success(isEdit ? "Blog updated." : "Blog created.");
      router.push("/dashboard/blogs");
      router.refresh();
    } catch (err) {
      setError(err?.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="admin-card max-w-2xl space-y-5 p-6">

      <div>
        <label className="admin-label">Title *</label>
        <input
          required
          type="text"
          value={form.title}
          onChange={(e) => update("title", e.target.value)}
          className={inputCls}
          placeholder="e.g. Getting Started with ESP32"
        />
      </div>

      <div>
        <label className="admin-label">Slug *</label>
        <input
          required
          type="text"
          value={form.slug}
          onChange={(e) => update("slug", slugify(e.target.value))}
          className={inputCls}
          placeholder="getting-started-with-esp32"
        />
        <p className="mt-1 text-xs text-slate-400">URL: /blogs/{form.slug || "..."}</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="admin-label">Category</label>
          <input
            type="text"
            value={form.category}
            onChange={(e) => update("category", e.target.value)}
            className={inputCls}
          />
        </div>
        <div>
          <label className="admin-label">Author</label>
          <input
            type="text"
            value={form.author}
            onChange={(e) => update("author", e.target.value)}
            className={inputCls}
          />
        </div>
      </div>

      <div>
        <label className="admin-label">Excerpt *</label>
        <textarea
          required
          rows={2}
          value={form.excerpt}
          onChange={(e) => update("excerpt", e.target.value)}
          className={`${inputCls} resize-none`}
          placeholder="Short summary shown on the blog card"
        />
      </div>

      <div>
        <label className="admin-label">Content *</label>
        <textarea
          required
          rows={10}
          value={form.content}
          onChange={(e) => update("content", e.target.value)}
          className={inputCls}
          placeholder="Write the full blog content. Separate paragraphs with a blank line."
        />
      </div>

      <div>
        <label className="admin-label">Cover Image</label>
        {form.coverImage && (
          <div className="mb-3 overflow-hidden rounded-lg border border-admin-border p-1">
            {/* eslint-disable-next-line @next/next/no-img-element -- arbitrary uploaded URL, may not be on the next/image host allowlist */}
            <img src={form.coverImage} alt="Preview" className="h-32 w-full rounded object-cover" />
          </div>
        )}
        <div className="flex items-center gap-3">
          <label className="flex cursor-pointer items-center gap-2 rounded-lg bg-admin-accent px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-admin-accent-dark">
            {uploading && <Loader2 size={15} className="animate-spin" />}
            {uploading ? "Uploading..." : "Upload photo from device"}
            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
          </label>
        </div>
        <input
          type="text"
          value={form.coverImage}
          onChange={(e) => update("coverImage", e.target.value)}
          className={`${inputCls} mt-3`}
          placeholder="Or paste an image URL"
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          checked={form.published}
          onChange={(e) => update("published", e.target.checked)}
          className="admin-checkbox"
        />
        Published (visible on the site)
      </label>

      {error && <p className="text-sm font-medium text-admin-danger">{error}</p>}

      <div className="flex gap-3">
        <Button type="submit" variant="enterprise-primary" loading={saving}>
          {saving ? "Saving..." : isEdit ? "Save changes" : "Create Blog"}
        </Button>
        <Button type="button" variant="enterprise-outline" onClick={() => router.push("/dashboard/blogs")}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
