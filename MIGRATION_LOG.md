# Migration Log

Tracks known differences between `hardvanta` (source of truth) and this
project (`hvkart-admin`) that were deliberately deferred rather than fixed
immediately, so they aren't forgotten. Update this file whenever a phase
defers something instead of resolving it on the spot.

## Deferred items

### 1. `prisma/schema.prisma` — Order model missing shipping fields
- **Found during**: pre-Phase-4 drift check (2026-07-23)
- **Hardvanta state**: uncommitted local change adds to `model Order`:
  ```prisma
  trackingNumber    String?
  courierName       String?
  estimatedDeliveryAt DateTime?
  ```
- **Status in hvkart-admin**: not present — schema copied in Phase 1, before this change.
- **Why deferred**: belongs to the Orders/Shipping domain, out of scope for every phase so far (Auth, Admin Shell, Products, Categories & Brands).
- **Action required**: re-copy `prisma/schema.prisma` from hardvanta (verbatim) at the start of the Orders migration phase, after re-confirming hardvanta has committed this change (currently still uncommitted there as of the date above — re-check it's stable before copying).

### 2. `src/lib/email.js` → `src/services/email.js` — shared `send()` helper drift
- **Found during**: pre-Phase-4 drift check (2026-07-23)
- **Hardvanta state**: uncommitted local change to the shared `send()` helper:
  ```diff
  -    const { error } = await client.emails.send({ from, to, subject, html });
  +    const { data, error } = await client.emails.send({ from, to, subject, html });
       if (error) {
  -      console.error("[email] send failed:", error.message || error);
  -      return { sent: false, error: error.message };
  +      console.error("[email] send failed:", error);
  +      return { sent: false, error: error.message || error };
       }
  -    return { sent: true };
  +    return { sent: true, id: data?.id };
  ```
  Also rewrites `sendOrderShippedEmail` to include tracking number / courier / estimated delivery detail rows (depends on deferred item #1's new Order fields).
- **Status in hvkart-admin**: `services/email.js` has the pre-change `send()` helper and the original (unexpanded) `sendOrderShippedEmail`. The 3 functions currently in use (`sendOtpEmail`, `sendPasswordResetEmail`, `sendWelcomeEmail`) call the pre-change `send()` — functionally fine (still sends/logs correctly), just missing the `data.id` return value and slightly different error-log shape.
- **Why deferred**: `sendOrderShippedEmail` is Orders/Shipping domain, out of scope. The `send()` helper change is bundled in the same file/commit.
- **Action required**: re-copy `src/lib/email.js` from hardvanta (verbatim, full file as done in the Phase 1 revision) at the start of the Orders migration phase, once hardvanta commits this change.

## Resolved

_(none yet)_
