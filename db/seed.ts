import { db, bookmark, userPreferences, user } from "./index";
import { auth } from "../src/lib/auth";
import { eq } from "drizzle-orm";

// Seed function for Drizzle ORM
export async function seed() {
  console.log("🌱 Seeding database...");

  // 1. Create user account using better-auth API
  // This ensures the account is created in the exact format better-auth expects
  const email = "demo@entertainment.app";
  const password = "demo1234";
  const name = "Demo User";

  let userId: string;

  try {
    // Check if user already exists by querying the database directly
    const existingUsers = await db
      .select()
      .from(user)
      .where(eq(user.email, email))
      .limit(1);

    if (existingUsers.length > 0) {
      console.log("⚠️  User already exists, skipping user creation...");
      userId = existingUsers[0].id;
    } else {
      // Create user using better-auth's internal API
      // Use the auth instance's handler to process the sign-up request
      const baseURL =
        process.env.PUBLIC_BASE_URL ||
        (typeof import.meta !== "undefined" &&
          import.meta.env?.PUBLIC_BASE_URL) ||
        "http://localhost:4321";

      // Create a mock request object for the auth handler
      const request = new Request(`${baseURL}/api/auth/sign-up/email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          name,
        }),
      });

      // Use the auth instance's handler to process the request
      const response = await auth.handler(request);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create user: ${errorText}`);
      }

      const result = await response.json();

      if (!result?.user?.id) {
        throw new Error("Failed to create user: No user ID returned");
      }

      userId = result.user.id;
      console.log("✅ User created successfully via better-auth API");
    }
  } catch (error: any) {
    console.error("❌ Error creating user:", error.message);
    // If creation fails, try to find existing user
    const existingUsers = await db
      .select()
      .from(user)
      .where(eq(user.email, email))
      .limit(1);

    if (existingUsers.length > 0) {
      userId = existingUsers[0].id;
      console.log("⚠️  Using existing user");
    } else {
      throw error;
    }
  }

  // 3. Seed with default bookmarks
  await db.insert(bookmark).values([
    {
      userId: userId,
      title: "Beyond Earth",
      year: 2019,
      category: "Movie",
      rating: "PG",
      thumbnail: "/thumbnails/beyond-earth/regular/large.jpg",
    },
    {
      userId: userId,
      title: "Bottom Gear",
      year: 2021,
      category: "TV Series",
      rating: "PG",
      thumbnail: "/thumbnails/bottom-gear/regular/large.jpg",
    },
    {
      userId: userId,
      title: "Undiscovered Cities",
      year: 2019,
      category: "TV Series",
      rating: "E",
      thumbnail: "/thumbnails/undiscovered-cities/regular/large.jpg",
    },
  ]);

  // 4. Seed with default user preferences
  await db.insert(userPreferences).values({
    userId: userId,
    language: "en",
    showAdultContent: false,
    theme: "dark",
  });

  console.log("✅ Database seeded successfully with better-auth!");
  console.log("📧 Demo account: demo@entertainment.app");
  console.log("🔑 Password: demo1234");
}

// Run seed if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seed()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("❌ Seed failed:", error);
      process.exit(1);
    });
}
