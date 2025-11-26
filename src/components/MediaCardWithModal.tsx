import { useState } from "react";
import { MediaDetailModal } from "./MediaDetailModal";

interface MediaCardWithModalProps {
  title: string;
  tmdbId?: number;
  category: "Movie" | "TV Series";
  isBookmarked: boolean;
  children: React.ReactNode;
}

export function MediaCardWithModal({
  title,
  tmdbId,
  category,
  isBookmarked,
  children,
}: MediaCardWithModalProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!tmdbId) {
    return <>{children}</>;
  }

  return (
    <>
      <div onClick={() => setIsModalOpen(true)} className="cursor-pointer">
        {children}
      </div>
      <MediaDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        tmdbId={tmdbId}
        category={category}
        title={title}
        isBookmarked={isBookmarked}
      />
    </>
  );
}
