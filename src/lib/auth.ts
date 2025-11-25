import { betterAuth } from "better-auth";
import { db as astroDb } from "astro:db";
import { User, Session, Account, Verification } from "../../db/config";

// Get base URL from environment or default to localhost
const BASE_URL =
  import.meta.env.BASE_URL ||
  import.meta.env.PUBLIC_BASE_URL ||
  "http://localhost:4321";

// Create better-auth instance with Astro DB
export const auth = betterAuth({
  baseURL: BASE_URL,
  database: {
    provider: "sqlite",
    db: astroDb as any,
    type: "sqlite",
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Set to true if you want email verification
  },
  socialProviders: {
    // OAuth providers - automatically enabled when credentials are set
    ...(import.meta.env.GOOGLE_CLIENT_ID && import.meta.env.GOOGLE_CLIENT_SECRET
      ? {
          google: {
            clientId: import.meta.env.GOOGLE_CLIENT_ID,
            clientSecret: import.meta.env.GOOGLE_CLIENT_SECRET,
          },
        }
      : {}),
    ...(import.meta.env.GITHUB_CLIENT_ID && import.meta.env.GITHUB_CLIENT_SECRET
      ? {
          github: {
            clientId: import.meta.env.GITHUB_CLIENT_ID,
            clientSecret: import.meta.env.GITHUB_CLIENT_SECRET,
          },
        }
      : {}),
  },
  trustedOrigins: [
    "http://localhost:4321",
    "http://localhost:3000",
    BASE_URL,
    ...(import.meta.env.PROD ? [import.meta.env.SITE || ""] : []),
  ].filter(Boolean),
});

export type Session = typeof auth.$Infer.Session;
