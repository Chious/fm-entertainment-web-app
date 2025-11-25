import { db, Bookmark, eq, and } from "astro:db";

export interface BookmarkData {
  id?: number;
  userId: string; // Changed from number to string for better-auth
  title: string;
  year?: number;
  category: string;
  rating?: string;
  thumbnail?: string;
  imdbId?: string;
}

/**
 * Get all bookmarks for a user
 */
export async function getUserBookmarks(userId: string) {
  return await db.select().from(Bookmark).where(eq(Bookmark.userId, userId));
}

/**
 * Add a bookmark for a user
 */
export async function addBookmark(bookmark: BookmarkData) {
  const result = await db.insert(Bookmark).values(bookmark).returning();
  return result[0];
}

/**
 * Remove a bookmark by ID
 */
export async function removeBookmark(bookmarkId: number, userId: string) {
  await db
    .delete(Bookmark)
    .where(and(eq(Bookmark.id, bookmarkId), eq(Bookmark.userId, userId)));
}

/**
 * Check if a media item is bookmarked by user
 */
export async function isBookmarked(
  userId: string,
  title: string
): Promise<boolean> {
  const bookmarks = await db
    .select()
    .from(Bookmark)
    .where(and(eq(Bookmark.userId, userId), eq(Bookmark.title, title)));

  return bookmarks.length > 0;
}

/**
 * Toggle bookmark (add if not exists, remove if exists)
 */
export async function toggleBookmark(bookmark: BookmarkData) {
  const existing = await db
    .select()
    .from(Bookmark)
    .where(
      and(
        eq(Bookmark.userId, bookmark.userId),
        eq(Bookmark.title, bookmark.title)
      )
    );

  if (existing.length > 0) {
    // Remove bookmark
    await db
      .delete(Bookmark)
      .where(
        and(
          eq(Bookmark.userId, bookmark.userId),
          eq(Bookmark.title, bookmark.title)
        )
      );
    return { action: "removed", bookmark: existing[0] };
  } else {
    // Add bookmark
    const result = await db.insert(Bookmark).values(bookmark).returning();
    return { action: "added", bookmark: result[0] };
  }
}
