import {
  getMovieDetail,
  getTVShowDetail,
  convertMovieToMediaItem,
  convertTVShowToMediaItem,
} from "./fetch";
import { getBookmarkedConfigs, getMediaConfig } from "@/constants/media-config";
import type { MediaItem } from "./types";

/**
 * Fetch all media items (popular movies and TV shows)
 * @param movieLimit - Number of movies to fetch
 * @param tvLimit - Number of TV shows to fetch
 */
export const fetchAllMedia = async (
  movieLimit: number = 15,
  tvLimit: number = 15
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
        const config = getMediaConfig(movie.id, "movie");
        const detail = await getMovieDetail(movie.id);
        return convertMovieToMediaItem(detail, {
          isTrending: false,
          isBookmarked: config?.isBookmarked || false,
        });
      } catch (error) {
        console.error(`Error fetching movie ${movie.id}:`, error);
        return null;
      }
    });

    const tvPromises = tvShows.map(async (tvShow: any) => {
      try {
        const config = getMediaConfig(tvShow.id, "tv");
        const detail = await getTVShowDetail(tvShow.id);
        return convertTVShowToMediaItem(detail, {
          isTrending: false,
          isBookmarked: config?.isBookmarked || false,
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
 */
export const fetchTrendingMedia = async (
  limit: number = 10
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
        const config = getMediaConfig(item.id, mediaType);

        if (mediaType === "movie") {
          const detail = await getMovieDetail(item.id);
          return convertMovieToMediaItem(detail, {
            isTrending: true,
            isBookmarked: config?.isBookmarked || false,
          });
        } else if (mediaType === "tv") {
          const detail = await getTVShowDetail(item.id);
          return convertTVShowToMediaItem(detail, {
            isTrending: true,
            isBookmarked: config?.isBookmarked || false,
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
 * Fetch bookmarked media items
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
 * Fetch popular movies
 * @param limit - Number of movies to fetch
 */
export const fetchMovies = async (limit: number = 20): Promise<MediaItem[]> => {
  try {
    const { getPopularMovies } = await import("./fetch");

    const moviesResponse = await getPopularMovies(1);
    const movies = moviesResponse.results.slice(0, limit);

    const promises = movies.map(async (movie: any) => {
      try {
        const config = getMediaConfig(movie.id, "movie");
        const detail = await getMovieDetail(movie.id);
        return convertMovieToMediaItem(detail, {
          isTrending: false,
          isBookmarked: config?.isBookmarked || false,
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
 */
export const fetchTVSeries = async (
  limit: number = 20
): Promise<MediaItem[]> => {
  try {
    const { getPopularTVShows } = await import("./fetch");

    const tvShowsResponse = await getPopularTVShows(1);
    const tvShows = tvShowsResponse.results.slice(0, limit);

    const promises = tvShows.map(async (tvShow: any) => {
      try {
        const config = getMediaConfig(tvShow.id, "tv");
        const detail = await getTVShowDetail(tvShow.id);
        return convertTVShowToMediaItem(detail, {
          isTrending: false,
          isBookmarked: config?.isBookmarked || false,
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
