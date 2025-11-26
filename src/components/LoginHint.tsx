import { useSession } from "@/lib/auth-client";
import { useState } from "react";

export function LoginHint() {
  const { data: session, isPending } = useSession();
  const [dismissed, setDismissed] = useState(false);

  if (isPending || session?.user || dismissed) {
    return null;
  }

  return (
    <div className="bg-semi-dark-blue rounded-lg p-6 md:p-8 mb-8 border border-greyish-blue/50">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex-1">
          <h3 className="text-xl md:text-2xl font-light text-pure-white mb-2">
            Create an account to bookmark your favorites
          </h3>
          <p className="text-greyish-blue text-sm md:text-base">
            Sign up to save movies and TV series you want to watch later
          </p>
        </div>
        <div className="flex gap-3">
          <a
            href="/signup"
            className="px-6 py-3 bg-red text-pure-white rounded-md hover:bg-pure-white hover:text-dark-blue transition-colors font-light whitespace-nowrap"
          >
            Sign Up
          </a>
          <a
            href="/login"
            className="px-6 py-3 bg-transparent border border-greyish-blue text-pure-white rounded-md hover:border-pure-white transition-colors font-light whitespace-nowrap"
          >
            Login
          </a>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="absolute top-4 right-4 text-greyish-blue hover:text-pure-white transition-colors"
          aria-label="Dismiss"
        >
          <svg
            className="w-5 h-5"
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
      </div>
    </div>
  );
}
