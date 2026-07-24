"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/utils/formatPrice";
import { imageSrc } from "@/utils/imageSrc";
import { Trash2 } from "lucide-react";
import DeleteProductButton from "@/components/admin/DeleteProductButton";
import ConfirmModal from "@/components/ui/ConfirmModal";
import Badge from "@/components/admin/ui/Badge";
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
        <div className="admin-card mb-3 flex items-center justify-between px-4 py-2.5">
          <span className="text-sm font-medium text-slate-700">{selected.size} selected</span>
          <button
            onClick={() => setConfirmOpen(true)}
            className="admin-focus-ring flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-1.5 text-sm font-semibold text-admin-danger transition-colors hover:bg-red-100"
          >
            <Trash2 size={14} /> Delete selected
          </button>
        </div>
      )}

      <div className="admin-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-admin-border bg-slate-50/80">
              <tr>
                <th className="admin-th w-10">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    aria-label="Select all products"
                    className="admin-checkbox"
                  />
                </th>
                <th className="admin-th">Product</th>
                <th className="admin-th">Brand</th>
                <th className="admin-th">Category</th>
                <th className="admin-th">Price</th>
                <th className="admin-th">Stock</th>
                <th className="admin-th text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-admin-border">
              {products.map((p) => (
                <tr key={p.id} className="admin-row-hover">
                  <td className="admin-td">
                    <input
                      type="checkbox"
                      checked={selected.has(p.id)}
                      onChange={() => toggleOne(p.id)}
                      aria-label={`Select ${p.name}`}
                      className="admin-checkbox"
                    />
                  </td>
                  <td className="admin-td">
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                        <Image
                          src={imageSrc(p.image || "")}
                          alt={p.name}
                          fill
                          sizes="40px"
                          className="object-cover"
                        />
                      </div>
                      <span className="font-medium text-slate-900">{p.name}</span>
                    </div>
                  </td>
                  <td className="admin-td text-slate-500">{p.brand?.name || "-"}</td>
                  <td className="admin-td text-slate-500">{p.category?.name || "-"}</td>
                  <td className="admin-td font-semibold text-slate-900">
                    {formatPrice(p.salePrice ?? p.price)}
                  </td>
                  <td className="admin-td">
                    <Badge tone={p.stock === 0 ? "red" : p.stock <= 5 ? "amber" : "green"} dot>
                      {p.stock}
                    </Badge>
                  </td>
                  <td className="admin-td">
                    <div className="flex justify-end gap-3">
                      <Link
                        href={`/dashboard/products/${p.id}/edit`}
                        className="font-semibold text-admin-accent hover:text-admin-accent-dark"
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
