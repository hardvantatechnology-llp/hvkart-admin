// Batched product-stock helpers used inside order/cancel transactions.
//
// The original code ran one query per cart/order line inside a single held
// transaction (a `for` loop of `SELECT ... FOR UPDATE`, then a `for`/
// `Promise.all` of per-row `UPDATE`s). Under Prisma's interactive
// transactions every one of those still runs sequentially on the SAME
// reserved connection — Promise.all doesn't parallelize them, it just queues
// them — so an order with N line items held that one pooled connection for
// N (or 2N) round trips instead of 1. On a connection-limited pooler
// (Supabase pgbouncer), that materially cuts how many concurrent
// orders/payments the pool can serve, and large orders could hit the
// transaction timeout outright. These helpers do the same lock/update work
// in a single batched statement regardless of item count.
// Copied verbatim from hardvanta/src/lib/stock.js.
import { Prisma } from "@prisma/client";

/**
 * Row-lock every product in `productIds` in one round trip (replaces a
 * `for` loop of individual `SELECT ... FOR UPDATE` queries).
 * @returns {Promise<Array<{id: string, stock: number, inStock: boolean, name: string}>>}
 */
export async function lockProductsForUpdate(tx, productIds) {
  if (productIds.length === 0) return [];
  return tx.$queryRaw`
    SELECT id, stock, "inStock", name
    FROM "Product"
    WHERE id = ANY(${productIds}::text[])
    FOR UPDATE
  `;
}

/**
 * Apply a signed stock delta per product in one round trip (replaces a
 * `for`/`Promise.all` loop of individual `UPDATE ... decrement/increment`
 * calls). `items` is `[{ productId, quantity }]`; `sign` is -1 to decrement
 * (placing an order) or +1 to increment (restoring stock on cancellation).
 */
export async function applyStockDeltas(tx, items, sign) {
  if (items.length === 0) return;
  const rows = Prisma.join(
    items.map((it) => Prisma.sql`(${it.productId}::text, ${sign * it.quantity}::int)`)
  );
  await tx.$executeRaw`
    UPDATE "Product" AS p
    SET stock = p.stock + v.delta
    FROM (VALUES ${rows}) AS v(id, delta)
    WHERE p.id = v.id
  `;
}
