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
          className="rounded-lg glass-card px-3 py-2 text-sm text-white outline-none focus:shadow-glow-electric placeholder:text-white/30"
          disabled={pending}
        />
        {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
      </div>
      <Button type="submit" variant="gradient" disabled={pending}>
        <Plus size={16} /> {pending ? "Adding…" : `Add ${label}`}
      </Button>
    </form>
  );
}
