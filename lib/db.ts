import { neon, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "@/db/schema";

let dbInstance: ReturnType<typeof drizzle> | ReturnType<typeof drizzlePg> | null = null;

export function getDb() {
  if (dbInstance) return dbInstance;
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  // Check if it's a local PostgreSQL connection (localhost or 127.0.0.1)
  const isLocal = connectionString.includes("localhost") || 
                  connectionString.includes("127.0.0.1") ||
                  (!connectionString.includes("neon.tech") && !connectionString.includes("vercel") && !connectionString.includes("supabase"));

  if (isLocal) {
    // Use standard PostgreSQL driver for local connections
    const pool = new Pool({ connectionString });
    dbInstance = drizzlePg(pool, { schema });
  } else {
    // Use Neon serverless driver for remote connections
    neonConfig.fetchConnectionCache = true;
    const sql = neon(connectionString);
    dbInstance = drizzle(sql, { schema });
  }
  
  return dbInstance;
}
