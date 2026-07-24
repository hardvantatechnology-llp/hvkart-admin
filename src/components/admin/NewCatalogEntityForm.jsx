"use client";

import { useState, useRef, useTransition } from "react";
import { Plus } from "lucide-react";
import Button from "@/components/ui/Button";

/** Quick "add category / add brand" form driven by a bound Server Action.
 * Copied verbatim from hardvanta/src/components/admin/NewCatalogEntityForm.jsx. */
export default function NewCatalogEntityForm({ label, onCreate }) {
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const formRef = useRef(null);

  function handleSubmit(e) {
    e.preventDefault();
    setError("");
    const fd = new FormData(formRef.current);
    if (!String(fd.get("name") || "").trim()) {
      setError("Name is required.");
      return;
    }
    startTransition(async () => {
      try {
        await onCreate(fd);
        formRef.current?.reset();
      } catch (err) {
        setError(err?.message || "Could not create.");
      }
    });
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="flex items-start gap-2">
      <div>
        <input
          name="name"
          placeholder={`New ${label} name`}
          aria-label={`New ${label} name`}
          className="admin-input"
          disabled={pending}
        />
        {error && <p className="mt-1 text-xs text-admin-danger">{error}</p>}
      </div>
      <Button type="submit" variant="enterprise-primary" loading={pending}>
        <Plus size={16} /> {pending ? "Adding…" : `Add ${label}`}
      </Button>
    </form>
  );
}
