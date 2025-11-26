import { db, userPreferences } from "../../db/index";
import { eq } from "drizzle-orm";

export interface UserPreference {
  language: string;
  showAdultContent: boolean;
  theme: string;
}

/**
 * Get user preferences by user ID
 * Creates default preferences if none exist
 */
export async function getUserPreferences(
  userId: string
): Promise<UserPreference> {
  const result = await db
    .select()
    .from(userPreferences)
    .where(eq(userPreferences.userId, userId))
    .limit(1);

  if (result.length === 0) {
    // Create default preferences
    await db.insert(userPreferences).values({
      userId,
      language: "en",
      showAdultContent: false,
      theme: "dark",
    });

    return {
      language: "en",
      showAdultContent: false,
      theme: "dark",
    };
  }

  const prefs = result[0];
  return {
    language: prefs.language,
    showAdultContent: prefs.showAdultContent ?? false,
    theme: prefs.theme,
  };
}

/**
 * Update user preferences
 */
export async function updateUserPreferences(
  userId: string,
  preferences: Partial<UserPreference>
): Promise<void> {
  // Check if preferences exist
  const existing = await db
    .select()
    .from(userPreferences)
    .where(eq(userPreferences.userId, userId))
    .limit(1);

  if (existing.length === 0) {
    // Create new preferences
    await db.insert(userPreferences).values({
      userId,
      language: preferences.language || "en",
      showAdultContent: preferences.showAdultContent ?? false,
      theme: preferences.theme || "dark",
    });
  } else {
    // Update existing preferences
    await db
      .update(userPreferences)
      .set(preferences)
      .where(eq(userPreferences.userId, userId));
  }
}
