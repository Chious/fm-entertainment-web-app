import {
  getMovieDetail,
  getTVShowDetail,
  convertMovieToMediaItem,
  convertTVShowToMediaItem,
} from "./fetch";
import { getBookmarkedConfigs, getMediaConfig } from "@/constants/media-config";
import { getUserBookmarks, isBookmarked } from "./bookmarks";
import type { MediaItem } from "./types";

/**
 * Check if a media item is bookmarked by user (from database)
 * Falls back to static config if userId is not provided
 */
async function checkBookmarkStatus(
  title: string,
  userId?: string,
  tmdbId?: number,
  mediaType?: "movie" | "tv"
): Promise<boolean> {
  // If userId is provided, check database
  if (userId) {
    try {
      return await isBookmarked(userId, title);
    } catch (error) {
      console.error(`Error checking bookmark status for ${title}:`, error);
      // Fall through to static config
    }
  }

  // Fallback to static config
  if (tmdbId && mediaType) {
    const config = getMediaConfig(tmdbId, mediaType);
    return config?.isBookmarked || false;
  }

  return false;
}

/**
 * Fetch all media items (popular movies and TV shows)
 * @param movieLimit - Number of movies to fetch
 * @param tvLimit - Number of TV shows to fetch
 * @param userId - Optional user ID to check bookmarks from database
 */
export const fetchAllMedia = async (
  movieLimit: number = 15,
  tvLimit: number = 15,
  userId?: string
): Promise<MediaItem[]> => {
  try {
    const { getPopularMovies, getPopularTVShows } = await import("./fetch");

    // Fetch popular movies and TV shows
    const [moviesResponse, tvShowsResponse] = await Promise.all([
      getPopularMovies(1),
      getPopularTVShows(1),
    ]);

    // Combine and limit results
    const movies = moviesResponse.results.slice(0, movieLimit);
    const tvShows = tvShowsResponse.results.slice(0, tvLimit);

    // Fetch detailed info for each item
    const moviePromises = movies.map(async (movie: any) => {
      try {
        const detail = await getMovieDetail(movie.id);
        const bookmarked = await checkBookmarkStatus(
          detail.title,
          userId,
          movie.id,
          "movie"
        );
        return convertMovieToMediaItem(detail, {
          isTrending: false,
          isBookmarked: bookmarked,
        });
      } catch (error) {
        console.error(`Error fetching movie ${movie.id}:`, error);
        return null;
      }
    });

    const tvPromises = tvShows.map(async (tvShow: any) => {
      try {
        const detail = await getTVShowDetail(tvShow.id);
        const bookmarked = await checkBookmarkStatus(
          detail.name,
          userId,
          tvShow.id,
          "tv"
        );
        return convertTVShowToMediaItem(detail, {
          isTrending: false,
          isBookmarked: bookmarked,
        });
      } catch (error) {
        console.error(`Error fetching TV show ${tvShow.id}:`, error);
        return null;
      }
    });

    const results = await Promise.all([...moviePromises, ...tvPromises]);
    return results.filter((item): item is MediaItem => item !== null);
  } catch (error) {
    console.error("Error fetching all media:", error);
    return [];
  }
};

/**
 * Fetch trending media items from TMDB API
 * @param limit - Number of trending items to fetch (default: 10)
 * @param userId - Optional user ID to check bookmarks from database
 */
export const fetchTrendingMedia = async (
  limit: number = 10,
  userId?: string
): Promise<MediaItem[]> => {
  try {
    const { getTrending, getMovieDetail, getTVShowDetail } = await import(
      "./fetch"
    );

    // Get trending items from TMDB API
    const trendingResponse = await getTrending("all", "week");

    // Limit the results
    const trendingItems = trendingResponse.results.slice(0, limit);

    // Fetch detailed info for each trending item
    const promises = trendingItems.map(async (item: any) => {
      try {
        const mediaType = item.media_type || (item.title ? "movie" : "tv");

        if (mediaType === "movie") {
          const detail = await getMovieDetail(item.id);
          const bookmarked = await checkBookmarkStatus(
            detail.title,
            userId,
            item.id,
            "movie"
          );
          return convertMovieToMediaItem(detail, {
            isTrending: true,
            isBookmarked: bookmarked,
          });
        } else if (mediaType === "tv") {
          const detail = await getTVShowDetail(item.id);
          const bookmarked = await checkBookmarkStatus(
            detail.name,
            userId,
            item.id,
            "tv"
          );
          return convertTVShowToMediaItem(detail, {
            isTrending: true,
            isBookmarked: bookmarked,
          });
        }
        return null;
      } catch (error) {
        console.error(`Error fetching trending item ${item.id}:`, error);
        return null;
      }
    });

    const results = await Promise.all(promises);
    return results.filter((item): item is MediaItem => item !== null);
  } catch (error) {
    console.error("Error fetching trending media:", error);
    return [];
  }
};

/**
 * Fetch bookmarked media items from static config (legacy)
 */
export const fetchBookmarkedMedia = async (): Promise<MediaItem[]> => {
  try {
    const bookmarkedConfigs = getBookmarkedConfigs();
    const promises = bookmarkedConfigs.map(async (config) => {
      try {
        if (config.type === "movie") {
          const detail = await getMovieDetail(config.id);
          return convertMovieToMediaItem(detail, {
            isTrending: false,
            isBookmarked: true,
          });
        } else {
          const detail = await getTVShowDetail(config.id);
          return convertTVShowToMediaItem(detail, {
            isTrending: false,
            isBookmarked: true,
          });
        }
      } catch (error) {
        console.error(
          `Error fetching bookmarked ${config.type} ${config.id}:`,
          error
        );
        return null;
      }
    });

    const results = await Promise.all(promises);
    return results.filter((item): item is MediaItem => item !== null);
  } catch (error) {
    console.error("Error fetching bookmarked media:", error);
    return [];
  }
};

/**
 * Fetch bookmarked media items from database for a specific user
 * Uses data stored in the database (title, year, category, rating, thumbnail)
 * If thumbnail is missing, uses a placeholder
 */
export const fetchUserBookmarkedMedia = async (
  userId: string
): Promise<MediaItem[]> => {
  try {
    // Get bookmarks from database
    const bookmarks = await getUserBookmarks(userId);

    if (bookmarks.length === 0) {
      return [];
    }

    // Convert database bookmarks to MediaItem format
    return bookmarks.map((bookmark) => {
      // Use stored thumbnail or placeholder
      const thumbnailUrl = bookmark.thumbnail || "/placeholder-image.jpg";

      return {
        title: bookmark.title,
        thumbnail: {
          regular: {
            small: thumbnailUrl,
            medium: thumbnailUrl,
            large: thumbnailUrl,
          },
        },
        year: bookmark.year || new Date().getFullYear(),
        category: bookmark.category as "Movie" | "TV Series",
        rating: bookmark.rating || "N/A",
        isBookmarked: true,
        isTrending: false,
        imdbID: bookmark.imdbId || undefined,
      } as MediaItem;
    });
  } catch (error) {
    console.error("Error fetching user bookmarked media:", error);
    throw error; // Re-throw to allow error handling in the page
  }
};

/**
 * Fetch popular movies
 * @param limit - Number of movies to fetch
 * @param userId - Optional user ID to check bookmarks from database
 */
export const fetchMovies = async (
  limit: number = 20,
  userId?: string
): Promise<MediaItem[]> => {
  try {
    const { getPopularMovies } = await import("./fetch");

    const moviesResponse = await getPopularMovies(1);
    const movies = moviesResponse.results.slice(0, limit);

    const promises = movies.map(async (movie: any) => {
      try {
        const detail = await getMovieDetail(movie.id);
        const bookmarked = await checkBookmarkStatus(
          detail.title,
          userId,
          movie.id,
          "movie"
        );
        return convertMovieToMediaItem(detail, {
          isTrending: false,
          isBookmarked: bookmarked,
        });
      } catch (error) {
        console.error(`Error fetching movie ${movie.id}:`, error);
        return null;
      }
    });

    const results = await Promise.all(promises);
    return results.filter((item): item is MediaItem => item !== null);
  } catch (error) {
    console.error("Error fetching movies:", error);
    return [];
  }
};

/**
 * Fetch popular TV series
 * @param limit - Number of TV shows to fetch
 * @param userId - Optional user ID to check bookmarks from database
 */
export const fetchTVSeries = async (
  limit: number = 20,
  userId?: string
): Promise<MediaItem[]> => {
  try {
    const { getPopularTVShows } = await import("./fetch");

    const tvShowsResponse = await getPopularTVShows(1);
    const tvShows = tvShowsResponse.results.slice(0, limit);

    const promises = tvShows.map(async (tvShow: any) => {
      try {
        const detail = await getTVShowDetail(tvShow.id);
        const bookmarked = await checkBookmarkStatus(
          detail.name,
          userId,
          tvShow.id,
          "tv"
        );
        return convertTVShowToMediaItem(detail, {
          isTrending: false,
          isBookmarked: bookmarked,
        });
      } catch (error) {
        console.error(`Error fetching TV show ${tvShow.id}:`, error);
        return null;
      }
    });

    const results = await Promise.all(promises);
    return results.filter((item): item is MediaItem => item !== null);
  } catch (error) {
    console.error("Error fetching TV series:", error);
    return [];
  }
};

/**
 * Filter media items
 */
export const filterMedia = (
  items: MediaItem[],
  filters: {
    category?: "Movie" | "TV Series";
    isTrending?: boolean;
    isBookmarked?: boolean;
  }
): MediaItem[] => {
  return items.filter((item) => {
    if (filters.category && item.category !== filters.category) return false;
    if (
      filters.isTrending !== undefined &&
      item.isTrending !== filters.isTrending
    )
      return false;
    if (
      filters.isBookmarked !== undefined &&
      item.isBookmarked !== filters.isBookmarked
    )
      return false;
    return true;
  });
};
