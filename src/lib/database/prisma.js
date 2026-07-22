// Prisma client singleton — avoids exhausting DB connections in dev (hot reload).
// Copied verbatim from hardvanta/src/lib/prisma.js — same database, same client behavior.
import { PrismaClient, Prisma } from "@prisma/client";

const globalForPrisma = globalThis;

// Slow-query threshold for the diagnostic log below — deliberately not
// logging every query (that'd be noisy and adds overhead on every request);
// this is for spotting which query is actually eating the connection-pool
// wait time on a pgbouncer(connection_limit=N) setup, not routine tracing.
const SLOW_QUERY_MS = 300;

// Transient connection failures — the pooler resetting an idle/stale
// connection (observed as `ECONNRESET`/"forcibly closed by the remote
// host"), or a slow handshake timing out — happen before any query result
// could have reached the database, so retrying the operation outright is
// safe. This does NOT paper over a real data problem: only these specific
// connection-level error codes are retried, everything else still throws
// immediately.
const RETRYABLE_CODES = new Set(["P1001", "P1002", "P1008", "P1017"]);
const MAX_ATTEMPTS = 3;
const RETRY_DELAY_MS = 200;

function isRetryableConnectionError(err) {
  if (err instanceof Prisma.PrismaClientInitializationError) return true;
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    return RETRYABLE_CODES.has(err.code);
  }
  // The Rust query engine also logs this class of error directly (see the
  // `log: [{ emit: "stdout", level: "error" }]` below) without always
  // surfacing a typed error code to JS — fall back to matching the message.
  return /connection.*(reset|closed)|forcibly closed|server has closed the connection/i.test(
    err?.message || ""
  );
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function createBaseClient() {
  return new PrismaClient({
    log: [
      { emit: "event", level: "query" },
      { emit: "stdout", level: "error" },
    ],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });
}

const basePrisma = globalForPrisma.prismaBase || createBaseClient();

if (!globalForPrisma.prismaSlowQueryLoggerAttached) {
  basePrisma.$on("query", (e) => {
    if (e.duration >= SLOW_QUERY_MS) {
      console.warn(`[prisma:slow-query] ${e.duration}ms — ${e.query}`);
    }
  });
  globalForPrisma.prismaSlowQueryLoggerAttached = true;
}

export const prisma =
  globalForPrisma.prisma ||
  basePrisma.$extends({
    query: {
      async $allOperations({ args, query }) {
        let lastErr;
        for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
          try {
            return await query(args);
          } catch (err) {
            lastErr = err;
            if (!isRetryableConnectionError(err) || attempt === MAX_ATTEMPTS) throw err;
            console.warn(
              `[prisma:retry] attempt ${attempt} failed (${err.code || err.message?.slice(0, 80)}), retrying…`
            );
            await sleep(RETRY_DELAY_MS * attempt);
          }
        }
        throw lastErr;
      },
    },
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prismaBase = basePrisma;
  globalForPrisma.prisma = prisma;
}
