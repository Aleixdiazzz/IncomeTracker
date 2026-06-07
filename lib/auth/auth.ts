// lib/auth/auth.ts
// Owner: Auth layer
// Purpose: Server-side Better Auth instance. Reads from / writes to Postgres
// via the Drizzle adapter. The `nextCookies` plugin lets Server Actions set
// session cookies (otherwise the cookie would be dropped at the action boundary).
//
// The `databaseHooks.user.create.after` hook seeds default categories on
// signup — every new account lands on the dashboard with usable buckets.
//
// Invariants:
//   - Server-only file. Importing this from a Client Component will leak the
//     pg connection into the bundle. Use lib/auth/client.ts in client code.
//   - Schema column names match Better Auth defaults; see db/schema/auth.ts.
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { db, schema } from "@/db";
import { seedDefaultCategoriesForUser } from "@/db/seed-defaults";

const secret = process.env.BETTER_AUTH_SECRET;
if (!secret) {
  throw new Error("BETTER_AUTH_SECRET is not set. See .env.example.");
}

export const auth = betterAuth({
  secret,
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // seconds — short cache to absorb burst reads
    },
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          await seedDefaultCategoriesForUser(user.id);
        },
      },
    },
  },
  plugins: [nextCookies()],
});

export type Auth = typeof auth;
