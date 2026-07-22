"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/utils/formatPrice";
import { imageSrc } from "@/utils/imageSrc";
import { Trash2 } from "lucide-react";
import DeleteProductButton from "@/components/admin/DeleteProductButton";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { useToast } from "@/components/ui/Toast";
import { useRouter } from "next/navigation";

// Adapted from hardvanta/src/components/admin/ProductsTable.jsx — only the
// Edit link's href prefix changed (/admin/products -> /dashboard/products).
export default function ProductsTable({ products }) {
  const router = useRouter();
  const toast = useToast();
  const [selected, setSelected] = useState(new Set());
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const allSelected = products.length > 0 && selected.size === products.length;

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(products.map((p) => p.id)));
  }
  function toggleOne(id) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleBulkDelete() {
    setLoading(true);
    setError("");
    try {
      const ids = [...selected];
      const results = await Promise.all(
        ids.map((id) => fetch(`/api/products/${id}`, { method: "DELETE" }))
      );
      const failed = results.filter((r) => !r.ok).length;
      if (failed > 0) {
        throw new Error(`${failed} of ${ids.length} products could not be deleted.`);
      }
      toast.success(`Deleted ${ids.length} product${ids.length !== 1 ? "s" : ""}.`);
      setSelected(new Set());
      setConfirmOpen(false);
      router.refresh();
    } catch (err) {
      setError(err.message || "Bulk delete failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {selected.size > 0 && (
        <div className="mb-3 flex items-center justify-between rounded-xl glass-card px-4 py-2.5">
          <span className="text-sm font-medium text-white/80">{selected.size} selected</span>
          <button
            onClick={() => setConfirmOpen(true)}
            className="flex items-center gap-1.5 rounded-lg bg-red-500/10 px-3 py-1.5 text-sm font-semibold text-red-400 hover:bg-red-500/20 transition-colors"
          >
            <Trash2 size={14} /> Delete selected
          </button>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl glass-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-white/10 bg-white/[0.03] text-left text-xs uppercase text-white/40">
              <tr>
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    aria-label="Select all products"
                    className="accent-electric"
                  />
                </th>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Brand</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-white/10 last:border-0 hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selected.has(p.id)}
                      onChange={() => toggleOne(p.id)}
                      aria-label={`Select ${p.name}`}
                      className="accent-electric"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 overflow-hidden rounded bg-white/5">
                        <Image
                          src={imageSrc(p.image || "")}
                          alt={p.name}
                          fill
                          sizes="40px"
                          className="object-cover"
                        />
                      </div>
                      <span className="font-medium text-white/90">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-white/50">{p.brand?.name || "-"}</td>
                  <td className="px-4 py-3 text-white/50">{p.category?.name || "-"}</td>
                  <td className="px-4 py-3 font-semibold text-white">
                    {formatPrice(p.salePrice ?? p.price)}
                  </td>
                  <td className="px-4 py-3 text-white/70">{p.stock}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-3">
                      <Link
                        href={`/dashboard/products/${p.id}/edit`}
                        className="font-semibold text-electric-light hover:text-cyan"
                      >
                        Edit
                      </Link>
                      <DeleteProductButton id={p.id} name={p.name} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmModal
        open={confirmOpen}
        onClose={() => { setConfirmOpen(false); setError(""); }}
        onConfirm={handleBulkDelete}
        loading={loading}
        error={error}
        title={`Delete ${selected.size} product${selected.size !== 1 ? "s" : ""}?`}
        description="This cannot be undone."
        confirmLabel="Delete"
      />
    </>
  );
}
