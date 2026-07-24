"use client";

import { useState, useRef, useTransition } from "react";
import { Eye, EyeOff } from "lucide-react";
import Button from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

/** Change-own-password form for the Profile page, driven by a bound Server
 * Action. Styled to match this project's existing admin forms (admin-input
 * inputs + enterprise-primary Button, e.g. NewCatalogEntityForm.jsx). */
export default function ChangePasswordForm({ onSubmit }) {
  const toast = useToast();
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const formRef = useRef(null);

  function handleSubmit(e) {
    e.preventDefault();
    setError("");
    const fd = new FormData(formRef.current);
    startTransition(async () => {
      try {
        await onSubmit(fd);
        formRef.current?.reset();
        toast.success("Password changed.");
      } catch (err) {
        const message = err?.message || "Could not change password.";
        setError(message);
        toast.error(message);
      }
    });
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="max-w-sm space-y-4">
      {error && <p className="text-sm text-admin-danger">{error}</p>}

      <div>
        <label htmlFor="currentPassword" className="admin-label">
          Current password
        </label>
        <div className="relative">
          <input
            id="currentPassword"
            name="currentPassword"
            type={showCurrent ? "text" : "password"}
            autoComplete="current-password"
            required
            disabled={pending}
            className="admin-input pr-10"
          />
          <button
            type="button"
            onClick={() => setShowCurrent((v) => !v)}
            aria-label={showCurrent ? "Hide password" : "Show password"}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
          >
            {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      <div>
        <label htmlFor="newPassword" className="admin-label">
          New password
        </label>
        <div className="relative">
          <input
            id="newPassword"
            name="newPassword"
            type={showNew ? "text" : "password"}
            autoComplete="new-password"
            required
            minLength={8}
            disabled={pending}
            className="admin-input pr-10"
          />
          <button
            type="button"
            onClick={() => setShowNew((v) => !v)}
            aria-label={showNew ? "Hide password" : "Show password"}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
          >
            {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        <p className="mt-1 text-xs text-slate-400">Minimum 8 characters.</p>
      </div>

      <Button type="submit" variant="enterprise-primary" loading={pending}>
        {pending ? "Changing…" : "Change Password"}
      </Button>
    </form>
  );
}
