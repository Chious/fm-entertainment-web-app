import { useState, useEffect } from "react";
import { getMovieDetail, getTVShowDetail } from "@/lib/fetch";
import type { TMDBMovieDetail, TMDBTVShowDetail } from "@/lib/types";
import BookmarkButton from "./BookmarkButton";

interface MediaDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  tmdbId: number;
  category: "Movie" | "TV Series";
  title: string;
  isBookmarked: boolean;
}

export function MediaDetailModal({
  isOpen,
  onClose,
  tmdbId,
  category,
  title,
  isBookmarked: initialBookmarked,
}: MediaDetailModalProps) {
  const [detail, setDetail] = useState<
    TMDBMovieDetail | TMDBTVShowDetail | null
  >(null);
  const [loading, setLoading] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(initialBookmarked);

  useEffect(() => {
    if (isOpen && tmdbId) {
      setLoading(true);
      const fetchDetail = async () => {
        try {
          const data =
            category === "Movie"
              ? await getMovieDetail(tmdbId)
              : await getTVShowDetail(tmdbId);
          setDetail(data);
        } catch (error) {
          console.error("Failed to fetch detail:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchDetail();
    }
  }, [isOpen, tmdbId, category]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const backdropUrl = detail?.backdrop_path
    ? `https://image.tmdb.org/t/p/w1280${detail.backdrop_path}`
    : null;
  const posterUrl = detail?.poster_path
    ? `https://image.tmdb.org/t/p/w500${detail.poster_path}`
    : null;

  const director =
    category === "Movie"
      ? (detail as TMDBMovieDetail)?.credits?.crew?.find(
          (person) => person.job === "Director"
        )?.name
      : null;

  const cast = detail?.credits?.cast?.slice(0, 5) || [];
  const genres = detail?.genres?.map((g) => g.name).join(", ") || "";
  const runtime =
    category === "Movie"
      ? `${(detail as TMDBMovieDetail)?.runtime} min`
      : `${
          (detail as TMDBTVShowDetail)?.episode_run_time?.[0] || 0
        } min/episode`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-semi-dark-blue rounded-lg shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center bg-black/50 hover:bg-black/70 rounded-full text-pure-white transition-colors"
          aria-label="Close"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {loading ? (
          <div className="p-8 text-center text-pure-white">Loading...</div>
        ) : detail ? (
          <>
            {/* Backdrop image */}
            {backdropUrl && (
              <div className="relative h-64 md:h-96 overflow-hidden">
                <img
                  src={backdropUrl}
                  alt={title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-linear-to-t from-semi-dark-blue via-semi-dark-blue/50 to-transparent" />
              </div>
            )}

            <div className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Poster */}
                {posterUrl && (
                  <div className="shrink-0">
                    <img
                      src={posterUrl}
                      alt={title}
                      className="w-32 md:w-48 rounded-lg shadow-lg"
                    />
                  </div>
                )}

                {/* Details */}
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <h2 className="text-2xl md:text-4xl font-light text-pure-white mb-2">
                        {"title" in detail ? detail.title : detail.name}
                      </h2>
                      <div className="flex flex-wrap items-center gap-2 text-sm text-pure-white/75">
                        {"release_date" in detail && detail.release_date && (
                          <span>
                            {new Date(detail.release_date).getFullYear()}
                          </span>
                        )}
                        {"first_air_date" in detail &&
                          detail.first_air_date && (
                            <span>
                              {new Date(detail.first_air_date).getFullYear()}
                            </span>
                          )}
                        {genres && <span>• {genres}</span>}
                        {runtime && <span>• {runtime}</span>}
                        {detail.vote_average && (
                          <span>• ⭐ {detail.vote_average.toFixed(1)}</span>
                        )}
                      </div>
                    </div>
                    <BookmarkButton
                      isBookmarked={isBookmarked}
                      onToggle={() => setIsBookmarked(!isBookmarked)}
                    />
                  </div>

                  {detail.overview && (
                    <p className="text-pure-white/90 mb-4 leading-relaxed">
                      {detail.overview}
                    </p>
                  )}

                  {director && (
                    <div className="mb-4">
                      <span className="text-pure-white/75">Director: </span>
                      <span className="text-pure-white">{director}</span>
                    </div>
                  )}

                  {cast.length > 0 && (
                    <div>
                      <h3 className="text-lg font-medium text-pure-white mb-2">
                        Cast
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {cast.map((actor) => (
                          <span
                            key={actor.id}
                            className="text-sm text-pure-white/75"
                          >
                            {actor.name}
                            {actor.character && ` as ${actor.character}`}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="p-8 text-center text-pure-white">
            Failed to load details
          </div>
        )}
      </div>
    </div>
  );
}
