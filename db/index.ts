// db/index.ts
// Owner: DB layer
// Purpose: Single Drizzle client used by the entire app.
// Invariants:
//   - Only the DAL (lib/dal/*) imports `db`. UI / actions go through repos.
//   - The pool is cached on globalThis so Next.js dev HMR does not leak connections.
//     Without this, every file-change reload opens a new pg.Pool until Postgres
//     refuses connections.
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL is not set. Did you copy .env.example to .env.local?",
  );
}

type DrizzleClient = ReturnType<typeof drizzle<typeof schema>>;

declare global {
  // eslint-disable-next-line no-var
  var __incometrackerDb: DrizzleClient | undefined;
  // eslint-disable-next-line no-var
  var __incometrackerPool: Pool | undefined;
}

const pool =
  globalThis.__incometrackerPool ??
  new Pool({ connectionString: databaseUrl, max: 10 });

export const db: DrizzleClient =
  globalThis.__incometrackerDb ?? drizzle(pool, { schema });

if (process.env.NODE_ENV !== "production") {
  globalThis.__incometrackerPool = pool;
  globalThis.__incometrackerDb = db;
}

export { schema };
