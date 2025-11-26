import { db, bookmark } from "../../db/index";
import { eq, and } from "drizzle-orm";

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
  return await db.select().from(bookmark).where(eq(bookmark.userId, userId));
}

/**
 * Add a bookmark for a user
 */
export async function addBookmark(bookmarkData: BookmarkData) {
  const result = await db.insert(bookmark).values(bookmarkData).returning();
  return result[0];
}

/**
 * Remove a bookmark by ID
 */
export async function removeBookmark(bookmarkId: number, userId: string) {
  await db
    .delete(bookmark)
    .where(and(eq(bookmark.id, bookmarkId), eq(bookmark.userId, userId)));
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
    .from(bookmark)
    .where(and(eq(bookmark.userId, userId), eq(bookmark.title, title)));

  return bookmarks.length > 0;
}

/**
 * Toggle bookmark (add if not exists, remove if exists)
 */
export async function toggleBookmark(bookmarkData: BookmarkData) {
  const existing = await db
    .select()
    .from(bookmark)
    .where(
      and(
        eq(bookmark.userId, bookmarkData.userId),
        eq(bookmark.title, bookmarkData.title)
      )
    );

  if (existing.length > 0) {
    // Remove bookmark
    await db
      .delete(bookmark)
      .where(
        and(
          eq(bookmark.userId, bookmarkData.userId),
          eq(bookmark.title, bookmarkData.title)
        )
      );
    return { action: "removed", bookmark: existing[0] };
  } else {
    // Add bookmark
    const result = await db.insert(bookmark).values(bookmarkData).returning();
    return { action: "added", bookmark: result[0] };
  }
}
