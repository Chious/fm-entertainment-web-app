import { atom, map } from "nanostores";

/**
 * Bookmark state store
 * Maps title -> isBookmarked boolean
 */
export const bookmarksStore = map<Record<string, boolean>>({});

/**
 * Set bookmark state for a specific title
 */
export function setBookmark(title: string, isBookmarked: boolean) {
  const current = bookmarksStore.get();
  bookmarksStore.set({
    ...current,
    [title]: isBookmarked,
  });
}

/**
 * Get bookmark state for a specific title
 */
export function getBookmark(title: string): boolean {
  const current = bookmarksStore.get();
  return current[title] ?? false;
}

/**
 * Toggle bookmark state for a specific title
 */
export function toggleBookmark(title: string) {
  const current = getBookmark(title);
  setBookmark(title, !current);
}

/**
 * Initialize bookmarks from server data
 * Call this when page loads to sync with server state
 */
export function initBookmarks(bookmarks: Array<{ title: string; isBookmarked: boolean }>) {
  const bookmarkMap: Record<string, boolean> = {};
  bookmarks.forEach(({ title, isBookmarked }) => {
    bookmarkMap[title] = isBookmarked;
  });
  bookmarksStore.set(bookmarkMap);
}

/**
 * Clear all bookmarks (e.g., on logout)
 */
export function clearBookmarks() {
  bookmarksStore.set({});
}


