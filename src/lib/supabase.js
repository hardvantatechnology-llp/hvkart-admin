// Server-side Supabase client using the service-role key (full access).
// NEVER import this in client components — the service key must stay secret.
// Copied verbatim from hardvanta/src/lib/supabase.js.
import { createClient } from "@supabase/supabase-js";

export function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null; // Not configured yet.
  return createClient(url, key, {
    auth: { persistSession: false },
  });
}

export const PRODUCT_BUCKET = "hardvanta technologies";
