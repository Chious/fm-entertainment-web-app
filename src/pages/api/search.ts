import type { APIRoute } from "astro";
import {
  searchMovies,
  searchTVShows,
  getMovieDetail,
  getTVShowDetail,
  convertMovieToMediaItem,
  convertTVShowToMediaItem,
} from "@/lib/fetch";
import { getMediaConfig } from "@/constants/media-config";
import type { MediaItem } from "@/lib/types";

export const GET: APIRoute = async ({ url }) => {
  const query = url.searchParams.get("q");
  const category = url.searchParams.get("category"); // "Movie" | "TV Series" | undefined
  const limit = parseInt(url.searchParams.get("limit") || "20");

  if (!query || query.trim() === "") {
    return new Response(
      JSON.stringify({ error: "Query parameter is required" }),
      {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }

  try {
    const results: MediaItem[] = [];

    // Search based on category filter
    if (!category || category === "Movie") {
      const movieResults = await searchMovies({ query: query.trim() });

      // Get detailed info for top movies
      const moviePromises = movieResults.results
        .slice(0, limit)
        .map(async (movie: any) => {
          try {
            const detail = await getMovieDetail(movie.id);
            const config = getMediaConfig(movie.id, "movie");
            return convertMovieToMediaItem(detail, {
              isTrending: false,
              isBookmarked: config?.isBookmarked || false,
            });
          } catch (error) {
            console.error(`Error fetching movie ${movie.id}:`, error);
            return null;
          }
        });

      const movies = await Promise.all(moviePromises);
      results.push(...movies.filter((m): m is MediaItem => m !== null));
    }

    if (!category || category === "TV Series") {
      const tvResults = await searchTVShows({ query: query.trim() });

      // Get detailed info for top TV shows
      const tvPromises = tvResults.results
        .slice(0, limit)
        .map(async (tv: any) => {
          try {
            const detail = await getTVShowDetail(tv.id);
            const config = getMediaConfig(tv.id, "tv");
            return convertTVShowToMediaItem(detail, {
              isTrending: false,
              isBookmarked: config?.isBookmarked || false,
            });
          } catch (error) {
            console.error(`Error fetching TV show ${tv.id}:`, error);
            return null;
          }
        });

      const tvShows = await Promise.all(tvPromises);
      results.push(...tvShows.filter((t): t is MediaItem => t !== null));
    }

    return new Response(JSON.stringify({ results }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=300", // Cache for 5 minutes
      },
    });
  } catch (error) {
    console.error("Search API error:", error);
    return new Response(JSON.stringify({ error: "Failed to search media" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
};
