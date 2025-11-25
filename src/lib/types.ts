// Application types
export interface MediaItem {
  title: string;
  thumbnail: {
    trending?: {
      small: string;
      medium: string;
      large: string;
    };
    regular: {
      small: string;
      medium: string;
      large: string;
    };
  };
  year: number;
  category: "Movie" | "TV Series";
  rating: string;
  isBookmarked: boolean;
  isTrending: boolean;
  tmdbID?: number;
  imdbID?: string;
  plot?: string;
  director?: string;
  actors?: string;
  genre?: string;
  voteAverage?: number;
  voteCount?: number;
}

// TMDB API Response types
export interface TMDBMovie {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  genre_ids: number[];
  vote_average: number;
  vote_count: number;
  popularity: number;
  adult: boolean;
  original_language: string;
  video: boolean;
}

export interface TMDBTVShow {
  id: number;
  name: string;
  original_name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string;
  genre_ids: number[];
  vote_average: number;
  vote_count: number;
  popularity: number;
  origin_country: string[];
  original_language: string;
}

export interface TMDBMovieDetail extends TMDBMovie {
  belongs_to_collection: any;
  budget: number;
  genres: Array<{ id: number; name: string }>;
  homepage: string;
  imdb_id: string;
  production_companies: Array<any>;
  production_countries: Array<any>;
  revenue: number;
  runtime: number;
  spoken_languages: Array<any>;
  status: string;
  tagline: string;
  credits?: {
    cast: Array<{
      id: number;
      name: string;
      character: string;
      profile_path: string | null;
    }>;
    crew: Array<{ id: number; name: string; job: string; department: string }>;
  };
  release_dates?: {
    results: Array<{
      iso_3166_1: string;
      release_dates: Array<{ certification: string; type: number }>;
    }>;
  };
}

export interface TMDBTVShowDetail extends TMDBTVShow {
  created_by: Array<any>;
  episode_run_time: number[];
  genres: Array<{ id: number; name: string }>;
  homepage: string;
  in_production: boolean;
  languages: string[];
  last_air_date: string;
  networks: Array<any>;
  number_of_episodes: number;
  number_of_seasons: number;
  production_companies: Array<any>;
  seasons: Array<any>;
  status: string;
  type: string;
  credits?: {
    cast: Array<{
      id: number;
      name: string;
      character: string;
      profile_path: string | null;
    }>;
    crew: Array<{ id: number; name: string; job: string; department: string }>;
  };
  content_ratings?: {
    results: Array<{ iso_3166_1: string; rating: string }>;
  };
}

export interface TMDBSearchResponse {
  page: number;
  results: (TMDBMovie | TMDBTVShow)[];
  total_pages: number;
  total_results: number;
}

// Fetch options
export interface TMDBSearchOptions {
  query: string;
  page?: number;
  year?: number;
  include_adult?: boolean;
}

export interface TMDBDetailOptions {
  id: number;
  append_to_response?: string;
}
