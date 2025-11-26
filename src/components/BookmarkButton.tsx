import { useState } from "react";
import { useStore } from "@nanostores/react";
import { toast } from "sonner";
import { bookmarksStore, setBookmark } from "@/stores/bookmarks";

interface BookmarkButtonProps {
  title: string;
  year?: number;
  category: "Movie" | "TV Series";
  rating?: string;
  thumbnail?: string | { small: string; medium: string; large: string };
  imdbId?: string;
  onToggle?: (isBookmarked: boolean) => void;
}

export default function BookmarkButton({
  title,
  year,
  category,
  rating,
  thumbnail,
  imdbId,
  onToggle,
}: BookmarkButtonProps) {
  // Get bookmark state directly from store
  const bookmarks = useStore(bookmarksStore);
  const isBookmarked = bookmarks[title] ?? false;

  const [isHovered, setIsHovered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Optimistic update - update store immediately for instant UI update
    const newState = !isBookmarked;
    setBookmark(title, newState);
    setIsLoading(true);

    try {
      // Prepare thumbnail URL
      const thumbnailUrl =
        typeof thumbnail === "string"
          ? thumbnail
          : thumbnail?.medium || thumbnail?.large || "";

      // Call API to toggle bookmark
      const response = await fetch("/api/bookmarks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          year,
          category,
          rating,
          thumbnail: thumbnailUrl,
          imdbId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to toggle bookmark");
      }

      // Store is already updated from optimistic update, just show success toast
      // Show success toast
      if (data.action === "added") {
        toast.success(`${title} added to bookmarks`);
      } else {
        toast.success(`${title} removed from bookmarks`);
      }

      // Call optional callback
      onToggle?.(newState);
    } catch (error) {
      // Revert optimistic update on error
      const revertedState = !newState;
      setBookmark(title, revertedState); // Revert in store (UI will update automatically)

      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to update bookmark. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      disabled={isLoading}
      className="bg-transparent border-none p-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
    >
      <div
        className={`flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full transition-all duration-300 ${
          isHovered ? "bg-white" : "bg-dark-blue/50"
        }`}
      >
        <svg width="12" height="14" xmlns="http://www.w3.org/2000/svg">
          <path
            d="m10.518.75.399 12.214-5.084-4.24-4.535 4.426L.75 1.036l9.768-.285Z"
            stroke={isHovered ? "#10141E" : "#FFF"}
            strokeWidth="1.5"
            fill={isBookmarked ? (isHovered ? "#10141E" : "#FFF") : "none"}
          />
        </svg>
      </div>
    </button>
  );
}
