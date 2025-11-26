import "dotenv/config";
import { defineConfig } from "drizzle-kit";

// Use Turso for production, local SQLite for development
// TURSO_DATABASE_URL is set in production (Vercel), undefined in local dev
const isProduction = !!process.env.TURSO_DATABASE_URL;
const databaseUrl = isProduction
  ? process.env.TURSO_DATABASE_URL!
  : "./.data/sqlite.db";

export default defineConfig({
  schema: "./db/schema.ts",
  out: "./db/migrations",
  dialect: "sqlite",
  dbCredentials: {
    url: databaseUrl,
  },
});
