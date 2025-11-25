import { useState } from "react";

interface BookmarkButtonProps {
  isBookmarked: boolean;
  onToggle?: (isBookmarked: boolean) => void;
}

export default function BookmarkButton({
  isBookmarked: initialBookmarked,
  onToggle,
}: BookmarkButtonProps) {
  const [isBookmarked, setIsBookmarked] = useState(initialBookmarked);
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newState = !isBookmarked;
    setIsBookmarked(newState);
    onToggle?.(newState);
  };

  return (
    <button
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="bg-transparent border-none p-0 cursor-pointer"
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
