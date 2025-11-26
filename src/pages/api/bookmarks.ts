import type { APIRoute } from "astro";
import { auth } from "@/lib/auth";
import {
  toggleBookmark,
  getUserBookmarks,
  type BookmarkData,
} from "@/lib/bookmarks";

// GET /api/bookmarks - Get all bookmarks for current user
export const GET: APIRoute = async ({ request }) => {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const bookmarks = await getUserBookmarks(session.user.id);

    return new Response(JSON.stringify(bookmarks), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Failed to fetch bookmarks:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch bookmarks" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};

// POST /api/bookmarks - Toggle bookmark (add or remove)
export const POST: APIRoute = async ({ request }) => {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    let body;
    try {
      body = await request.json();
    } catch (error) {
      console.error("Failed to parse request body:", error);
      return new Response(
        JSON.stringify({ error: "Invalid JSON in request body" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const { title, year, category, rating, thumbnail, imdbId } = body;

    // Log received data for debugging
    console.log("Bookmark API request:", {
      title,
      year,
      category,
      rating,
      thumbnail: thumbnail ? "provided" : "missing",
      imdbId: imdbId || "missing",
    });

    // Validate required fields
    if (!title || typeof title !== "string" || title.trim() === "") {
      return new Response(
        JSON.stringify({
          error: "Title is required and must be a non-empty string",
          received: { title, category },
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (!category || typeof category !== "string") {
      return new Response(
        JSON.stringify({
          error: "Category is required and must be a string",
          received: { title, category },
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Validate category
    if (!["Movie", "TV Series"].includes(category)) {
      return new Response(
        JSON.stringify({
          error: "Category must be 'Movie' or 'TV Series'",
          received: { title, category },
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const bookmarkData: BookmarkData = {
      userId: session.user.id,
      title,
      year: year
        ? typeof year === "number"
          ? year
          : parseInt(year)
        : undefined,
      category,
      rating: rating || undefined,
      thumbnail: thumbnail || undefined,
      imdbId: imdbId || undefined,
    };

    const result = await toggleBookmark(bookmarkData);

    return new Response(
      JSON.stringify({
        success: true,
        action: result.action,
        bookmark: result.bookmark,
        message:
          result.action === "added"
            ? "Bookmark added successfully"
            : "Bookmark removed successfully",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Failed to toggle bookmark:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to toggle bookmark",
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
