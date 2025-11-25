import type { AstroGlobal } from "astro";
import { auth } from "./auth";

/**
 * Get the current session from the request
 * Use this in Astro page frontmatter to check if user is logged in
 */
export async function getSession(Astro: AstroGlobal) {
  const session = await auth.api.getSession({
    headers: Astro.request.headers,
  });

  return session;
}

/**
 * Get the current user from the session
 * Returns null if user is not logged in
 */
export async function getCurrentUser(Astro: AstroGlobal) {
  const session = await getSession(Astro);
  return session?.user ?? null;
}

/**
 * Require authentication - redirects to login if not authenticated
 * Use this in pages that require login
 */
export async function requireAuth(Astro: AstroGlobal, redirectTo = "/login") {
  const user = await getCurrentUser(Astro);

  if (!user) {
    return Astro.redirect(redirectTo);
  }

  return user;
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(Astro: AstroGlobal): Promise<boolean> {
  const user = await getCurrentUser(Astro);
  return !!user;
}
