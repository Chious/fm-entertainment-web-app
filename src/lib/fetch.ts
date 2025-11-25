import type {
  TMDBSearchOptions,
  TMDBDetailOptions,
  TMDBSearchResponse,
  TMDBMovieDetail,
  TMDBTVShowDetail,
  MediaItem,
} from "./types";
import { cache } from "./cache";

const apiKey = import.meta.env.TMDB_APIKEY;
const BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p";

/**
 * TMDB Image sizes:
 * - Poster: w92, w154, w185, w342, w500, w780, original
 * - Backdrop: w300, w780, w1280, original
 */
export const TMDB_IMAGE_SIZES = {
  poster: {
    small: "w185",
    medium: "w342",
    large: "w500",
    original: "original",
  },
  backdrop: {
    small: "w300",
    medium: "w780",
    large: "w1280",
    original: "original",
  },
};

/**
 * Get TMDB image URL
 */
export const getTMDBImageUrl = (
  path: string | null,
  size: string = "w500"
): string => {
  if (!path) return "";
  return `${IMAGE_BASE_URL}/${size}${path}`;
};

/**
 * Search for movies
 */
export const searchMovies = async (
  options: TMDBSearchOptions
): Promise<TMDBSearchResponse> => {
  if (!apiKey) {
    console.error("TMDB API Key is missing!");
    throw new Error("API Key is required");
  }

  const params = new URLSearchParams({
    api_key: apiKey,
    query: options.query,
    page: (options.page || 1).toString(),
    include_adult: (options.include_adult || false).toString(),
  });

  if (options.year) params.append("year", options.year.toString());

  const response = await fetch(`${BASE_URL}/search/movie?${params.toString()}`);

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};

/**
 * Search for TV shows
 */
export const searchTVShows = async (
  options: TMDBSearchOptions
): Promise<TMDBSearchResponse> => {
  if (!apiKey) {
    console.error("TMDB API Key is missing!");
    throw new Error("API Key is required");
  }

  const params = new URLSearchParams({
    api_key: apiKey,
    query: options.query,
    page: (options.page || 1).toString(),
    include_adult: (options.include_adult || false).toString(),
  });

  if (options.year)
    params.append("first_air_date_year", options.year.toString());

  const response = await fetch(`${BASE_URL}/search/tv?${params.toString()}`);

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};

/**
 * Get movie details by TMDB ID
 */
export const getMovieDetail = async (
  id: number,
  options?: TMDBDetailOptions
): Promise<TMDBMovieDetail> => {
  // Check cache first
  const cacheKey = `movie_detail_${id}`;
  const cached = cache.get<TMDBMovieDetail>(cacheKey);
  if (cached) {
    return cached;
  }

  if (!apiKey) {
    console.error("TMDB API Key is missing!");
    throw new Error("API Key is required");
  }

  const params = new URLSearchParams({
    api_key: apiKey,
  });

  if (options?.append_to_response) {
    params.append("append_to_response", options.append_to_response);
  } else {
    // Default: get credits and release dates
    params.append("append_to_response", "credits,release_dates");
  }

  const response = await fetch(`${BASE_URL}/movie/${id}?${params.toString()}`);

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();

  // Cache for 1 hour
  cache.set(cacheKey, data, 60 * 60 * 1000);

  return data;
};

/**
 * Get TV show details by TMDB ID
 */
export const getTVShowDetail = async (
  id: number,
  options?: TMDBDetailOptions
): Promise<TMDBTVShowDetail> => {
  // Check cache first
  const cacheKey = `tv_detail_${id}`;
  const cached = cache.get<TMDBTVShowDetail>(cacheKey);
  if (cached) {
    return cached;
  }

  if (!apiKey) {
    console.error("TMDB API Key is missing!");
    throw new Error("API Key is required");
  }

  const params = new URLSearchParams({
    api_key: apiKey,
  });

  if (options?.append_to_response) {
    params.append("append_to_response", options.append_to_response);
  } else {
    // Default: get credits and content ratings
    params.append("append_to_response", "credits,content_ratings");
  }

  const response = await fetch(`${BASE_URL}/tv/${id}?${params.toString()}`);

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();

  // Cache for 1 hour
  cache.set(cacheKey, data, 60 * 60 * 1000);

  return data;
};

/**
 * Convert TMDB movie to MediaItem format
 */
export const convertMovieToMediaItem = (
  movie: TMDBMovieDetail,
  options?: { isBookmarked?: boolean; isTrending?: boolean }
): MediaItem => {
  // Get poster URLs in different sizes
  const posterSmall = getTMDBImageUrl(
    movie.poster_path,
    TMDB_IMAGE_SIZES.poster.small
  );
  const posterMedium = getTMDBImageUrl(
    movie.poster_path,
    TMDB_IMAGE_SIZES.poster.medium
  );
  const posterLarge = getTMDBImageUrl(
    movie.poster_path,
    TMDB_IMAGE_SIZES.poster.large
  );

  // Get backdrop URLs for trending
  const backdropSmall = getTMDBImageUrl(
    movie.backdrop_path,
    TMDB_IMAGE_SIZES.backdrop.small
  );
  const backdropMedium = getTMDBImageUrl(
    movie.backdrop_path,
    TMDB_IMAGE_SIZES.backdrop.medium
  );
  const backdropLarge = getTMDBImageUrl(
    movie.backdrop_path,
    TMDB_IMAGE_SIZES.backdrop.large
  );

  // Get US certification (rating)
  let rating = "Not Rated";
  if (movie.release_dates?.results) {
    const usRelease = movie.release_dates.results.find(
      (r) => r.iso_3166_1 === "US"
    );
    if (usRelease && usRelease.release_dates.length > 0) {
      const cert = usRelease.release_dates[0].certification;
      if (cert) rating = cert;
    }
  }

  // Get director
  let director = "";
  if (movie.credits?.crew) {
    const directorObj = movie.credits.crew.find((c) => c.job === "Director");
    if (directorObj) director = directorObj.name;
  }

  // Get top actors
  let actors = "";
  if (movie.credits?.cast) {
    actors = movie.credits.cast
      .slice(0, 3)
      .map((c) => c.name)
      .join(", ");
  }

  // Get genres
  const genre = movie.genres ? movie.genres.map((g) => g.name).join(", ") : "";

  // Get year
  const year = movie.release_date
    ? parseInt(movie.release_date.split("-")[0])
    : 0;

  return {
    title: movie.title,
    thumbnail: {
      trending: {
        small: backdropSmall || posterMedium,
        medium: backdropMedium || posterLarge,
        large: backdropLarge || posterLarge,
      },
      regular: {
        small: posterSmall,
        medium: posterMedium,
        large: posterLarge,
      },
    },
    year,
    category: "Movie",
    rating,
    isBookmarked: options?.isBookmarked || false,
    isTrending: options?.isTrending || false,
    tmdbID: movie.id,
    imdbID: movie.imdb_id,
    plot: movie.overview,
    director,
    actors,
    genre,
    voteAverage: movie.vote_average,
    voteCount: movie.vote_count,
  };
};

/**
 * Convert TMDB TV show to MediaItem format
 */
export const convertTVShowToMediaItem = (
  tvShow: TMDBTVShowDetail,
  options?: { isBookmarked?: boolean; isTrending?: boolean }
): MediaItem => {
  // Get poster URLs in different sizes
  const posterSmall = getTMDBImageUrl(
    tvShow.poster_path,
    TMDB_IMAGE_SIZES.poster.small
  );
  const posterMedium = getTMDBImageUrl(
    tvShow.poster_path,
    TMDB_IMAGE_SIZES.poster.medium
  );
  const posterLarge = getTMDBImageUrl(
    tvShow.poster_path,
    TMDB_IMAGE_SIZES.poster.large
  );

  // Get backdrop URLs for trending
  const backdropSmall = getTMDBImageUrl(
    tvShow.backdrop_path,
    TMDB_IMAGE_SIZES.backdrop.small
  );
  const backdropMedium = getTMDBImageUrl(
    tvShow.backdrop_path,
    TMDB_IMAGE_SIZES.backdrop.medium
  );
  const backdropLarge = getTMDBImageUrl(
    tvShow.backdrop_path,
    TMDB_IMAGE_SIZES.backdrop.large
  );

  // Get US content rating
  let rating = "Not Rated";
  if (tvShow.content_ratings?.results) {
    const usRating = tvShow.content_ratings.results.find(
      (r) => r.iso_3166_1 === "US"
    );
    if (usRating) rating = usRating.rating;
  }

  // Get creator as "director"
  let director = "";
  if (tvShow.created_by && tvShow.created_by.length > 0) {
    director = tvShow.created_by[0].name;
  }

  // Get top actors
  let actors = "";
  if (tvShow.credits?.cast) {
    actors = tvShow.credits.cast
      .slice(0, 3)
      .map((c) => c.name)
      .join(", ");
  }

  // Get genres
  const genre = tvShow.genres
    ? tvShow.genres.map((g) => g.name).join(", ")
    : "";

  // Get year
  const year = tvShow.first_air_date
    ? parseInt(tvShow.first_air_date.split("-")[0])
    : 0;

  return {
    title: tvShow.name,
    thumbnail: {
      trending: {
        small: backdropSmall || posterMedium,
        medium: backdropMedium || posterLarge,
        large: backdropLarge || posterLarge,
      },
      regular: {
        small: posterSmall,
        medium: posterMedium,
        large: posterLarge,
      },
    },
    year,
    category: "TV Series",
    rating,
    isBookmarked: options?.isBookmarked || false,
    isTrending: options?.isTrending || false,
    tmdbID: tvShow.id,
    plot: tvShow.overview,
    director,
    actors,
    genre,
    voteAverage: tvShow.vote_average,
    voteCount: tvShow.vote_count,
  };
};

/**
 * Get trending movies or TV shows
 * @param mediaType - "movie" or "tv" or "all"
 * @param timeWindow - "day" or "week"
 */
export const getTrending = async (
  mediaType: "movie" | "tv" | "all" = "all",
  timeWindow: "day" | "week" = "week"
): Promise<TMDBSearchResponse> => {
  // Check cache first
  const cacheKey = `trending_${mediaType}_${timeWindow}`;
  const cached = cache.get<TMDBSearchResponse>(cacheKey);
  if (cached) {
    return cached;
  }

  if (!apiKey) {
    console.error("TMDB API Key is missing!");
    throw new Error("API Key is required");
  }

  const params = new URLSearchParams({
    api_key: apiKey,
  });

  const response = await fetch(
    `${BASE_URL}/trending/${mediaType}/${timeWindow}?${params.toString()}`
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();

  // Cache for 20 minutes (trending changes frequently)
  cache.set(cacheKey, data, 20 * 60 * 1000);

  return data;
};

/**
 * Get popular movies
 */
export const getPopularMovies = async (
  page: number = 1
): Promise<TMDBSearchResponse> => {
  // Check cache first
  const cacheKey = `popular_movies_${page}`;
  const cached = cache.get<TMDBSearchResponse>(cacheKey);
  if (cached) {
    return cached;
  }

  if (!apiKey) {
    console.error("TMDB API Key is missing!");
    throw new Error("API Key is required");
  }

  const params = new URLSearchParams({
    api_key: apiKey,
    page: page.toString(),
  });

  const response = await fetch(
    `${BASE_URL}/movie/popular?${params.toString()}`
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();

  // Cache for 30 minutes
  cache.set(cacheKey, data, 30 * 60 * 1000);

  return data;
};

/**
 * Get popular TV shows
 */
export const getPopularTVShows = async (
  page: number = 1
): Promise<TMDBSearchResponse> => {
  // Check cache first
  const cacheKey = `popular_tv_${page}`;
  const cached = cache.get<TMDBSearchResponse>(cacheKey);
  if (cached) {
    return cached;
  }

  if (!apiKey) {
    console.error("TMDB API Key is missing!");
    throw new Error("API Key is required");
  }

  const params = new URLSearchParams({
    api_key: apiKey,
    page: page.toString(),
  });

  const response = await fetch(`${BASE_URL}/tv/popular?${params.toString()}`);

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();

  // Cache for 30 minutes
  cache.set(cacheKey, data, 30 * 60 * 1000);

  return data;
};

/**
 * Fetch multiple movies/shows by TMDB IDs
 */
export const fetchMediaByIds = async (
  ids: Array<{ id: number; type: "movie" | "tv" }>
): Promise<MediaItem[]> => {
  try {
    const promises = ids.map(async ({ id, type }) => {
      try {
        if (type === "movie") {
          const movie = await getMovieDetail(id);
          return convertMovieToMediaItem(movie);
        } else {
          const tvShow = await getTVShowDetail(id);
          return convertTVShowToMediaItem(tvShow);
        }
      } catch (error) {
        console.error(`Error fetching ${type} ${id}:`, error);
        return null;
      }
    });

    const results = await Promise.all(promises);
    return results.filter((item): item is MediaItem => item !== null);
  } catch (error) {
    console.error("Error fetching media:", error);
    return [];
  }
};
