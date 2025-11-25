import type { Config } from "drizzle-kit";
import { config } from "dotenv";
import { resolve } from "path";

// Load .env.local first, then fall back to .env
config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), ".env") });

const databaseUrl = process.env.DATABASE_URL!;

// Check if it's a local PostgreSQL connection
const isLocal = databaseUrl.includes("localhost") || 
                databaseUrl.includes("127.0.0.1") ||
                (!databaseUrl.includes("neon.tech") && !databaseUrl.includes("vercel") && !databaseUrl.includes("supabase"));

// Parse connection string for local connections
let dbCredentials: { url: string } | { host: string; port: number; user: string; password: string; database: string; ssl: boolean };

if (isLocal) {
  // For local PostgreSQL, parse the connection string
  const url = new URL(databaseUrl.replace("postgres://", "http://"));
  dbCredentials = {
    host: url.hostname,
    port: parseInt(url.port) || 5432,
    user: url.username,
    password: url.password,
    database: url.pathname.slice(1), // Remove leading slash
    ssl: false, // Local PostgreSQL doesn't need SSL
  };
} else {
  // For remote Neon, use URL directly
  dbCredentials = { url: databaseUrl };
}

export default {
  schema: "./db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials,
} satisfies Config;
