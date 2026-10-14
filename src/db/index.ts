import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

export type Db = ReturnType<typeof drizzle<typeof schema>>;

let cached: Db | undefined;

/** Koneksi Postgres (pakai connection pooler Supabase, port 6543 -> prepare:false). */
export function getDb(): Db {
  if (!cached) {
    const client = postgres(process.env.DATABASE_URL!, { prepare: false, max: 5 });
    cached = drizzle(client, { schema });
  }
  return cached;
}

export { schema };
