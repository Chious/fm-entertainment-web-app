import { useState } from "react";
import { authClient, useSession } from "@/lib/auth-client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function UserMenu() {
  const { data: session, isPending } = useSession();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await authClient.signOut();
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout failed:", error);
      setIsLoggingOut(false);
    }
  };

  if (isPending) {
    return (
      <div className="w-10 h-10 rounded-full bg-semi-dark-blue animate-pulse" />
    );
  }

  if (!session?.user) {
    return (
      <a
        href="/login"
        className="text-pure-white hover:text-red transition-colors"
      >
        Login
      </a>
    );
  }

  const user = session.user;
  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : user.email[0].toUpperCase();

  return (
    <div className="relative group">
      <Avatar className="cursor-pointer border-2 border-transparent group-hover:border-pure-white transition-colors">
        <AvatarImage src={user.image || undefined} alt={user.name || "User"} />
        <AvatarFallback className="bg-semi-dark-blue text-pure-white">
          {initials}
        </AvatarFallback>
      </Avatar>

      {/* Dropdown menu */}
      <div className="absolute left-auto right-0 md:left-full md:right-auto mt-2 md:ml-2 w-48 max-w-[calc(100vw-2rem)] bg-semi-dark-blue lg:bottom-0 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
        <div className="p-4 border-b border-greyish-blue">
          <p className="text-pure-white font-medium truncate">
            {user.name || "User"}
          </p>
          <p className="text-greyish-blue text-sm truncate">{user.email}</p>
        </div>
        <a
          href="/preferences"
          className="block w-full text-left px-4 py-2 text-pure-white hover:bg-dark-blue transition-colors"
        >
          Preferences
        </a>
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="w-full text-left px-4 py-2 text-pure-white hover:bg-dark-blue transition-colors disabled:opacity-50"
        >
          {isLoggingOut ? "Logging out..." : "Logout"}
        </button>
      </div>
    </div>
  );
}
