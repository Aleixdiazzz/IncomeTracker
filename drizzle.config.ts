// drizzle-kit reads this to generate migrations and run drizzle-studio.
// `npm run db:generate` diffs `db/schema/*.ts` against the latest migration in `db/migrations/`
// and writes a new SQL file. `npm run db:migrate` applies pending migrations to Postgres.
import { loadEnvConfig } from "@next/env";
import { defineConfig } from "drizzle-kit";

// `next dev` auto-loads .env.local, but drizzle-kit runs outside Next.
// `@next/env` ships with the next package, so no extra dependency is needed.
loadEnvConfig(process.cwd());

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL is not set. Copy .env.example to .env.local.");
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./db/schema/*.ts",
  out: "./db/migrations",
  dbCredentials: { url: databaseUrl },
  verbose: true,
  strict: true,
});
