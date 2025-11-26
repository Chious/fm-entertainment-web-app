import { initBookmarks } from "@/stores/bookmarks";

/**
 * Refresh bookmarks from API
 * Call this when page loads or becomes visible to sync with server state
 */
export async function refreshBookmarksFromAPI() {
  if (typeof window === "undefined") return;

  try {
    const response = await fetch("/api/bookmarks");
    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data)) {
        const bookmarks = data.map((bookmark: any) => ({
          title: bookmark.title,
          isBookmarked: true,
        }));
        initBookmarks(bookmarks);
      }
    } else if (response.status === 401) {
      // User not authenticated, clear bookmarks
      initBookmarks([]);
    }
  } catch (error) {
    console.error("Failed to refresh bookmarks:", error);
  }
}

/**
 * Initialize bookmarks on page load
 */
export function setupBookmarkSync() {
  if (typeof window === "undefined") return;

  // Refresh on initial load
  refreshBookmarksFromAPI();

  // Refresh when page becomes visible (user switches back to tab)
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
      refreshBookmarksFromAPI();
    }
  });

  // Refresh on window focus
  window.addEventListener("focus", () => {
    refreshBookmarksFromAPI();
  });

  // Refresh after Astro page transitions
  document.addEventListener("astro:page-load", () => {
    refreshBookmarksFromAPI();
  });
}
