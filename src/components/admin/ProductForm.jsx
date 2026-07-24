"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Upload, X } from "lucide-react";
import Button from "@/components/ui/Button";
import { imageSrc } from "@/utils/imageSrc";
import { useToast } from "@/components/ui/Toast";

// Adapted from hardvanta/src/components/admin/ProductForm.jsx — only the two
// post-save/cancel navigation targets changed (/admin/products ->
// /dashboard/products), matching this project's routes established in
// Phase 1/2. All form fields, validation, and API calls are unchanged.
const NEW_CATEGORY = "__new__";
const NEW_BRAND = "__new__";

export default function ProductForm({ product }) {
  const router = useRouter();
  const toast = useToast();
  const isEdit = Boolean(product);

  const [form, setForm] = useState({
    name: product?.name || "",
    sku: product?.sku || "",
    description: product?.description || "",
    price: product?.price ?? "",
    salePrice: product?.salePrice ?? "",
    stock: product?.stock ?? 0,
    inStock: product?.inStock ?? true,
    categoryId: product?.category?.id ?? "",
    brandId: product?.brand?.id ?? "",
    images: product?.images?.length
      ? product.images.map((i) => i.imageUrl)
      : product?.image
        ? [product.image]
        : [],
    featured: product?.featured || false,
  });
  const [urlInput, setUrlInput] = useState("");

  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [newBrand, setNewBrand] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [error, setError] = useState("");
  const [uploadMsg, setUploadMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [catRes, brandRes] = await Promise.all([
          fetch("/api/categories"),
          fetch("/api/brands"),
        ]);
        const catData = await catRes.json();
        const brandData = await brandRes.json();
        const cats = catData.categories || [];
        const brands = brandData.brands || [];
        setCategories(cats);
        setBrands(brands);
        setForm((f) => ({
          ...f,
          categoryId: f.categoryId || cats[0]?.id || "",
          brandId: f.brandId || brands[0]?.id || "",
        }));
      } catch {
        // categories/brands failed to load — form still usable, dropdowns just stay empty
      }
    }
    loadData();
  }, []);

  const creatingCategory = form.categoryId === NEW_CATEGORY;
  const creatingBrand = form.brandId === NEW_BRAND;

  function set(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleStockChange(value) {
    setForm((f) => ({ ...f, stock: value }));
  }

  function addImages(urls) {
    const list = Array.isArray(urls) ? urls : [urls];
    setForm((f) => ({ ...f, images: [...f.images, ...list.filter(Boolean)] }));
  }
  function removeImage(idx) {
    setForm((f) => ({ ...f, images: f.images.filter((_, i) => i !== idx) }));
  }
  function addUrl() {
    const u = urlInput.trim();
    if (!u) return;
    addImages(u);
    setUrlInput("");
  }

  async function handleFileUpload(e) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setError("");
    setUploadMsg("");
    setUploading(true);
    try {
      const fd = new FormData();
      files.forEach((f) => fd.append("file", f));
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (res.status === 403) {
          throw new Error("You're not signed in as an admin. Log out and log back in with your admin account, then try again.");
        }
        throw new Error(data.error || `Upload failed (HTTP ${res.status}).`);
      }
      const urls = data.urls || (data.url ? [data.url] : []);
      if (urls.length === 0) throw new Error("Upload returned no image URL.");
      addImages(urls);
      setUploadMsg(`✓ ${urls.length} photo${urls.length > 1 ? "s" : ""} uploaded!`);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!form.images.length) {
      setError("Please add at least one product image (upload or paste a URL).");
      return;
    }
    setLoading(true);

    try {
      let categoryId = form.categoryId;
      let brandId = form.brandId;

      if (creatingCategory) {
        const name = newCategory.trim();
        if (!name) {
          setError("Please enter a name for the new category.");
          setLoading(false);
          return;
        }
        const catRes = await fetch("/api/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name }),
        });
        const catData = await catRes.json();
        if (!catRes.ok) {
          setError(catData.error || "Could not create category.");
          setLoading(false);
          return;
        }
        categoryId = catData.category.id;
      }

      if (creatingBrand) {
        if (!newBrand.trim()) {
          setError("Please enter brand name.");
          setLoading(false);
          return;
        }
        const res = await fetch("/api/brands", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: newBrand }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Could not create brand.");
          setLoading(false);
          return;
        }
        brandId = data.brand.id;
      }

      const url = isEdit ? `/api/products/${product.id}` : "/api/products";
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          sku: form.sku,
          description: form.description,
          price: Number(form.price),
          salePrice: form.salePrice ? Number(form.salePrice) : null,
          stock: Number(form.stock),
          inStock: form.inStock,
          image: form.images[0],
          images: form.images,
          featured: form.featured,
          categoryId,
          brandId,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not save product.");
        setLoading(false);
        return;
      }

      setLoading(false);
      toast.success(isEdit ? "Product updated." : "Product created.");
      router.push("/dashboard/products");
      router.refresh();
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="admin-card max-w-2xl space-y-4 p-6">
      {error && (
        <p className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-admin-danger">{error}</p>
      )}

      <L label="Name">
        <input className={inputCls} value={form.name} onChange={(e) => set("name", e.target.value)} required />
      </L>

      <L label="SKU">
        <input className={inputCls} value={form.sku} onChange={(e) => set("sku", e.target.value)} required />
      </L>

      <L label="Description">
        <textarea className={inputCls} rows={3} value={form.description} onChange={(e) => set("description", e.target.value)} required />
      </L>

      <div className="grid gap-4 sm:grid-cols-3">
        <L label="Price (₹)">
          <input type="number" className={inputCls} value={form.price} onChange={(e) => set("price", e.target.value)} required />
        </L>
        <L label="Sale Price (₹, optional)">
          <input type="number" className={inputCls} value={form.salePrice ?? ""} onChange={(e) => set("salePrice", e.target.value)} />
        </L>
        <L label="Stock">
          <input
            type="number"
            className={inputCls}
            value={form.stock}
            min={0}
            onChange={(e) => handleStockChange(e.target.value)}
            required
          />
          <div className="mt-2 flex items-center gap-4">
            <label className="flex cursor-pointer items-center gap-1.5 text-sm">
              <input
                type="radio"
                name="inStock"
                checked={form.inStock === true}
                onChange={() => set("inStock", true)}
                className="admin-checkbox rounded-full"
              />
              <span className="font-medium text-admin-success">In Stock</span>
            </label>
            <label className="flex cursor-pointer items-center gap-1.5 text-sm">
              <input
                type="radio"
                name="inStock"
                checked={form.inStock === false}
                onChange={() => set("inStock", false)}
                className="admin-checkbox rounded-full"
              />
              <span className="font-medium text-admin-danger">Out of Stock</span>
            </label>
          </div>
        </L>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <L label="Brand">
          <select className={selectCls} value={form.brandId} onChange={(e) => set("brandId", e.target.value)}>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
            <option value={NEW_BRAND}>+ Create New Brand</option>
          </select>
          {creatingBrand && (
            <input className={`${inputCls} mt-2`} value={newBrand} onChange={(e) => setNewBrand(e.target.value)} placeholder="Brand name" />
          )}
        </L>
        <L label="Category">
          <select className={selectCls} value={form.categoryId} onChange={(e) => set("categoryId", e.target.value)}>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
            <option value={NEW_CATEGORY}>+ Create new category…</option>
          </select>
          {creatingCategory && (
            <input
              className={`${inputCls} mt-2`}
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="New category name (e.g. Soldering Tools)"
              autoFocus
            />
          )}
        </L>
      </div>

      <L label="Product Images">
        {/* Thumbnails of all added images */}
        <div className="flex flex-wrap gap-3">
          {form.images.map((url, idx) => (
            <div
              key={`${url}-${idx}`}
              className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-admin-border bg-slate-50"
            >
              <Image src={imageSrc(url)} alt={`Image ${idx + 1}`} fill sizes="80px" className="object-cover" />
              {idx === 0 && (
                <span className="absolute bottom-0 left-0 right-0 bg-admin-accent py-0.5 text-center text-[9px] font-semibold text-white">
                  Main
                </span>
              )}
              <button
                type="button"
                onClick={() => removeImage(idx)}
                className="absolute right-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-slate-900/70 text-white/80 shadow hover:text-red-300"
                aria-label="Remove image"
              >
                <X size={12} />
              </button>
            </div>
          ))}
          <label className="flex h-20 w-20 shrink-0 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-admin-accent/40 text-xs font-semibold text-admin-accent hover:bg-blue-50">
            <Upload size={18} />
            {uploading ? "…" : "Add"}
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              disabled={uploading}
              onChange={handleFileUpload}
            />
          </label>
        </div>
        {uploadMsg && (
          <p className="mt-2 rounded-lg border border-green-100 bg-green-50 px-3 py-2 text-sm font-medium text-admin-success">{uploadMsg}</p>
        )}
        {/* Add by URL */}
        <div className="mt-2 flex gap-2">
          <input
            className={inputCls}
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addUrl(); } }}
            placeholder="…or paste an image URL and press Add"
          />
          <button
            type="button"
            onClick={addUrl}
            className="admin-focus-ring shrink-0 rounded-lg border border-admin-border bg-white px-4 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
          >
            Add
          </button>
        </div>
        <p className="mt-1 text-xs text-slate-400">
          Upload multiple photos at once (Ctrl/Cmd-click to select several). The first
          image is used as the main product photo. Drag isn&apos;t needed — just remove and re-add to reorder.
        </p>
      </L>

      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input type="checkbox" checked={form.featured} onChange={(e) => set("featured", e.target.checked)} className="admin-checkbox" />
        Featured product (shows on homepage)
      </label>

      <div className="flex gap-3 pt-2">
        <Button type="submit" variant="enterprise-primary" loading={loading}>
          {loading ? "Saving…" : isEdit ? "Save changes" : "Create product"}
        </Button>
        <Button type="button" variant="enterprise-outline" onClick={() => router.push("/dashboard/products")}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

const inputCls = "admin-input";
const selectCls = "admin-select";

function L({ label, children }) {
  return (
    <div>
      <label className="admin-label">{label}</label>
      {children}
    </div>
  );
}
