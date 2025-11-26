import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../../db";

// Get base URL from environment or default to localhost
// Note: import.meta.env.SITE comes from astro.config.mjs
// Public env vars need PUBLIC_ prefix to be accessible
// Handle both Astro (import.meta.env) and Node.js (process.env) contexts
const BASE_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.SITE) ||
  (typeof import.meta !== "undefined" && import.meta.env?.PUBLIC_BASE_URL) ||
  process.env.PUBLIC_BASE_URL ||
  "http://localhost:4321";

// Create better-auth instance with Drizzle ORM
export const auth = betterAuth({
  baseURL: BASE_URL,
  database: drizzleAdapter(db, {
    provider: "sqlite",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Set to true if you want email verification
  },
  socialProviders: {
    // OAuth providers - automatically enabled when credentials are set
    ...((typeof import.meta !== "undefined" &&
      import.meta.env?.GOOGLE_CLIENT_ID) ||
    process.env.GOOGLE_CLIENT_ID
      ? {
          google: {
            clientId:
              (typeof import.meta !== "undefined" &&
                import.meta.env?.GOOGLE_CLIENT_ID) ||
              process.env.GOOGLE_CLIENT_ID ||
              "",
            clientSecret:
              (typeof import.meta !== "undefined" &&
                import.meta.env?.GOOGLE_CLIENT_SECRET) ||
              process.env.GOOGLE_CLIENT_SECRET ||
              "",
          },
        }
      : {}),
    ...((typeof import.meta !== "undefined" &&
      import.meta.env?.GITHUB_CLIENT_ID) ||
    process.env.GITHUB_CLIENT_ID
      ? {
          github: {
            clientId:
              (typeof import.meta !== "undefined" &&
                import.meta.env?.GITHUB_CLIENT_ID) ||
              process.env.GITHUB_CLIENT_ID ||
              "",
            clientSecret:
              (typeof import.meta !== "undefined" &&
                import.meta.env?.GITHUB_CLIENT_SECRET) ||
              process.env.GITHUB_CLIENT_SECRET ||
              "",
          },
        }
      : {}),
  },
  trustedOrigins: [
    "http://localhost:4321",
    "http://localhost:3000",
    BASE_URL,
    ...(typeof import.meta !== "undefined" && import.meta.env?.PROD
      ? [import.meta.env.SITE || ""]
      : []
    ).filter(Boolean),
  ].filter(Boolean),
});

export type Session = typeof auth.$Infer.Session;
