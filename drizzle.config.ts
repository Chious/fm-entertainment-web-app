import "dotenv/config";
import { defineConfig } from "drizzle-kit";

// Use Turso for production, local SQLite for development
// TURSO_DATABASE_URL is set in production (Vercel), undefined in local dev
const isProduction = !!process.env.TURSO_DATABASE_URL;

// For Turso, include auth token in URL if not already present
const getDatabaseUrl = () => {
  if (!isProduction) {
    return "./.data/sqlite.db";
  }

  const url = process.env.TURSO_DATABASE_URL!;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  // If URL already has authToken, return as is
  if (url.includes("authToken=")) {
    return url;
  }

  // Otherwise, append authToken to URL
  if (authToken) {
    const separator = url.includes("?") ? "&" : "?";
    return `${url}${separator}authToken=${authToken}`;
  }

  return url;
};

const databaseUrl = getDatabaseUrl();

export default defineConfig({
  schema: "./db/schema.ts",
  out: "./db/migrations",
  dialect: "sqlite",
  dbCredentials: {
    url: databaseUrl,
  },
});
