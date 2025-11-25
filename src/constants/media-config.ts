/**
 * Media configuration file
 * Maps TMDB IDs to bookmark status
 *
 * Note: Trending content is now fetched from TMDB's official Trending API
 * This config is primarily used to track bookmarked items
 *
 * To add bookmarked items:
 * 1. Find the TMDB ID on https://www.themoviedb.org/
 * 2. Add it below with isBookmarked: true
 */

export interface MediaConfig {
  id: number; // TMDB ID
  type: "movie" | "tv";
  isBookmarked?: boolean;
}

// Bookmarked media items
export const MEDIA_LIBRARY: MediaConfig[] = [
  // Bookmarked Movies
  { id: 278, type: "movie", isBookmarked: true }, // The Shawshank Redemption
  { id: 238, type: "movie", isBookmarked: true }, // The Godfather
  { id: 155, type: "movie", isBookmarked: true }, // The Dark Knight
  { id: 550, type: "movie", isBookmarked: true }, // Fight Club
  { id: 157336, type: "movie", isBookmarked: true }, // Interstellar

  // Bookmarked TV Series
  { id: 1396, type: "tv", isBookmarked: true }, // Breaking Bad
  { id: 60625, type: "tv", isBookmarked: true }, // Rick and Morty
  { id: 1668, type: "tv", isBookmarked: true }, // Friends
];

/**
 * Get all media configs
 */
export const getAllMediaConfigs = (): MediaConfig[] => {
  return MEDIA_LIBRARY;
};

/**
 * Get media config by TMDB ID
 */
export const getMediaConfig = (
  id: number,
  type: "movie" | "tv"
): MediaConfig | undefined => {
  return MEDIA_LIBRARY.find((item) => item.id === id && item.type === type);
};

/**
 * Get trending configs
 * @deprecated Use TMDB's trending API instead (see fetchTrendingMedia in media.ts)
 */
export const getTrendingConfigs = (): MediaConfig[] => {
  return [];
};

/**
 * Get bookmarked configs
 */
export const getBookmarkedConfigs = (): MediaConfig[] => {
  return MEDIA_LIBRARY.filter((item) => item.isBookmarked);
};

/**
 * Get movie configs
 */
export const getMovieConfigs = (): MediaConfig[] => {
  return MEDIA_LIBRARY.filter((item) => item.type === "movie");
};

/**
 * Get TV series configs
 */
export const getTVSeriesConfigs = (): MediaConfig[] => {
  return MEDIA_LIBRARY.filter((item) => item.type === "tv");
};
