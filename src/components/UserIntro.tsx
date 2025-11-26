import { useEffect } from "react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { useSession } from "@/lib/auth-client";

export function UserIntro() {
  const { data: session, isPending } = useSession();

  useEffect(() => {
    if (isPending || !session?.user) return;

    // Check if this user has seen the intro (user-specific localStorage key)
    const userId = session.user.id;
    const introKey = `hasSeenIntro_${userId}`;
    const hasSeenIntro = localStorage.getItem(introKey);

    if (hasSeenIntro === "true") return;

    const driverObj = driver({
      showProgress: true,
      steps: [
        {
          element: "nav",
          popover: {
            title: "Navigation",
            description:
              "Use the navigation bar to browse movies, TV series, and your bookmarks.",
            side: "bottom",
            align: "start",
          },
        },
        {
          element: '[data-intro="search"]',
          popover: {
            title: "Search",
            description: "Search for movies and TV series by title.",
            side: "bottom",
            align: "start",
          },
        },
        {
          element: '[data-intro="trending"]',
          popover: {
            title: "Trending",
            description: "Discover what's trending right now.",
            side: "bottom",
            align: "start",
          },
        },
        {
          element: '[data-intro="bookmark"]',
          popover: {
            title: "Bookmark",
            description:
              "Click the bookmark icon to save your favorites for later.",
            side: "top",
            align: "center",
          },
        },
        {
          element: '[data-intro="avatar"]',
          popover: {
            title: "Your Profile",
            description: "Access your preferences and account settings here.",
            side: "left",
            align: "start",
          },
        },
      ],
      onDestroyStarted: () => {
        // Mark intro as seen for this specific user
        localStorage.setItem(introKey, "true");
      },
    });

    // Start the tour after a short delay
    const timer = setTimeout(() => {
      driverObj.drive();
    }, 1000);

    return () => {
      clearTimeout(timer);
      driverObj.destroy();
    };
  }, [session, isPending]);

  return null;
}
