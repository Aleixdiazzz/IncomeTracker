// db/schema/index.ts
// Owner: DB layer
// Purpose: Re-export every schema so Drizzle Kit's glob (`./db/schema/*.ts`)
// pulls them, and downstream code can `import * as schema from "@/db/schema"`.
export * from "./auth";
export * from "./categories";
export * from "./recurring";
