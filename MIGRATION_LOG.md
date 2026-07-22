# Migration Log

Tracks known differences between `hardvanta` (source of truth) and this
project (`hvkart-admin`) that were deliberately deferred rather than fixed
immediately, so they aren't forgotten. Update this file whenever a phase
defers something instead of resolving it on the spot.

## Deferred items

_(none currently outstanding — see Resolved below)_

## Resolved

### 1. `prisma/schema.prisma` — Order model missing shipping fields
- **Deferred**: pre-Phase-4 drift check (2026-07-23)
- **Resolved**: Phase 6 (Orders migration) — re-copied `prisma/schema.prisma` from hardvanta verbatim, adding `trackingNumber`, `courierName`, `estimatedDeliveryAt` to `model Order`. Confirmed byte-identical to hardvanta's current schema after the change. Note: this field addition was still uncommitted in hardvanta at the time of this migration — re-verify hardvanta has since committed it, to avoid the two projects' schemas silently diverging again.

### 2. `src/lib/email.js` → `src/services/email.js` — shared `send()` helper drift
- **Deferred**: pre-Phase-4 drift check (2026-07-23)
- **Resolved**: Phase 6 (Orders migration) — full verbatim re-copy of hardvanta's current `src/lib/email.js` (all 13 functions, including the `send()` helper's `data.id`/error-shape change and the expanded `sendOrderShippedEmail`). `services/email.js` no longer a partial/trimmed copy. Same re-verification note as above applies — this was still uncommitted in hardvanta at copy time.
