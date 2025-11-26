import type { APIRoute } from "astro";
import { auth } from "@/lib/auth";
import { getUserPreferences, updateUserPreferences } from "@/lib/preferences";

// GET /api/preferences - Get user preferences
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

    const preferences = await getUserPreferences(session.user.id);

    return new Response(JSON.stringify(preferences), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Failed to fetch preferences:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch preferences" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};

// POST /api/preferences - Update user preferences
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

    const body = await request.json();
    const { language, showAdultContent, theme } = body;

    // Validate input
    if (language && !["en", "zh-TW"].includes(language)) {
      return new Response(
        JSON.stringify({ error: "Invalid language option" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (theme && !["dark", "light"].includes(theme)) {
      return new Response(JSON.stringify({ error: "Invalid theme option" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    await updateUserPreferences(session.user.id, {
      language,
      showAdultContent,
      theme,
    });

    return new Response(
      JSON.stringify({ success: true, message: "Preferences updated" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Failed to update preferences:", error);
    return new Response(
      JSON.stringify({ error: "Failed to update preferences" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
