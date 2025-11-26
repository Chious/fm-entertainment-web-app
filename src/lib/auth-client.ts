import { createAuthClient } from "better-auth/react";

// Get base URL from environment or use window.location.origin as fallback
const getBaseURL = () => {
  // In browser, use window.location.origin
  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  // During SSR, use environment variables
  return import.meta.env.PUBLIC_BASE_URL || "http://localhost:4321";
};

export const authClient = createAuthClient({
  baseURL: getBaseURL(),
});

export const { signIn, signOut, signUp, useSession } = authClient;
