import { db, User, Bookmark, UserPreferences, Account } from "astro:db";
import { hashPassword } from "./utils";

// https://astro.build/db/seed
export default async function seed() {
  // 1. Seed with default user account
  const userId = "demo-user-123";
  const hashedPassword = await hashPassword("demo1234");

  await db.insert(User).values({
    id: userId,
    email: "demo@entertainment.app",
    name: "Demo User",
    emailVerified: true,
    image: null,
  });

  // 2. Create email/password account for the user
  await db.insert(Account).values({
    id: "account-demo-123",
    accountId: "demo@entertainment.app",
    providerId: "credential",
    userId: userId,
    password: hashedPassword,
    accessToken: null,
    refreshToken: null,
    idToken: null,
    expiresAt: null,
  });

  // 3. Seed with default bookmarks
  await db.insert(Bookmark).values([
    {
      id: 1,
      userId: userId,
      title: "Beyond Earth",
      year: 2019,
      category: "Movie",
      rating: "PG",
      thumbnail: "/thumbnails/beyond-earth/regular/large.jpg",
    },
    {
      id: 2,
      userId: userId,
      title: "Bottom Gear",
      year: 2021,
      category: "TV Series",
      rating: "PG",
      thumbnail: "/thumbnails/bottom-gear/regular/large.jpg",
    },
    {
      id: 3,
      userId: userId,
      title: "Undiscovered Cities",
      year: 2019,
      category: "TV Series",
      rating: "E",
      thumbnail: "/thumbnails/undiscovered-cities/regular/large.jpg",
    },
  ]);

  // 4. Seed with default user preferences
  await db.insert(UserPreferences).values({
    id: 1,
    userId: userId,
    language: "en",
    showAdultContent: false,
    theme: "dark",
  });

  console.log("✅ Database seeded successfully with better-auth!");
  console.log("📧 Demo account: demo@entertainment.app");
  console.log("🔑 Password: demo1234");
}
