/**
 * Initialize bookmark button functionality
 * Used for dynamically loaded content (search results, etc.)
 */
export function initBookmarkButtons() {
  const bookmarkButtons = document.querySelectorAll(".bookmark-button");

  bookmarkButtons.forEach((button) => {
    // Remove existing listeners by cloning
    const newButton = button.cloneNode(true);
    button.parentNode?.replaceChild(newButton, button);

    newButton.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      const isBookmarked = newButton.dataset.bookmarked === "true";
      const newState = !isBookmarked;

      // Update button state
      newButton.dataset.bookmarked = String(newState);

      // Update SVG fill
      const path = newButton.querySelector("path");
      if (path) {
        path.setAttribute("fill", newState ? "#FFF" : "none");
      }

      // Add animation
      newButton.classList.add("scale-110");
      setTimeout(() => {
        newButton.classList.remove("scale-110");
      }, 200);

      // Here you could also save to localStorage or make an API call
      console.log("Bookmark toggled:", newState);
    });
  });
}

// Auto-initialize on page load
if (typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", initBookmarkButtons);
  document.addEventListener("astro:page-load", initBookmarkButtons);
}
