import { useState, useEffect } from "react";

interface PreferencesFormProps {
  initialPreferences?: {
    language: string;
    showAdultContent: boolean;
    theme: string;
  };
}

export function PreferencesForm({ initialPreferences }: PreferencesFormProps) {
  const [language, setLanguage] = useState(
    initialPreferences?.language || "en"
  );
  const [showAdultContent, setShowAdultContent] = useState(
    initialPreferences?.showAdultContent || false
  );
  const [theme, setTheme] = useState(initialPreferences?.theme || "dark");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/preferences", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          language,
          showAdultContent,
          theme,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({
          type: "success",
          text: "Preferences saved successfully!",
        });
      } else {
        setMessage({
          type: "error",
          text: data.error || "Failed to save preferences",
        });
      }
    } catch (error) {
      console.error("Failed to save preferences:", error);
      setMessage({ type: "error", text: "Failed to save preferences" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      {/* Language Selection */}
      <div className="space-y-2">
        <label
          htmlFor="language"
          className="block text-pure-white font-light text-lg"
        >
          Language / 語言
        </label>
        <select
          id="language"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="w-full px-4 py-3 bg-semi-dark-blue text-pure-white border-b border-b-greyish-blue outline-none transition-colors rounded-md appearance-none"
        >
          <option value="en">{`English (en)`}</option>
          <option value="zh-TW">{`繁體中文 (zh-TW)`}</option>
        </select>
      </div>

      {/* Adult Content Filter */}
      <div className="space-y-2">
        <label className="flex items-center space-x-3 cursor-pointer">
          <input
            type="checkbox"
            checked={showAdultContent}
            onChange={(e) => setShowAdultContent(e.target.checked)}
            className="w-5 h-5 bg-semi-dark-blue border-2 border-greyish-blue rounded checked:bg-pure-white checked:border-pure-white focus:outline-none focus:ring-2 focus:ring-pure-white transition-colors"
          />
          <span className="text-pure-white font-light text-lg">
            Show adult content (18+)
          </span>
        </label>
        <p className="text-greyish-blue text-sm ml-8">
          When enabled, search results may include mature content
        </p>
      </div>

      {/* Theme Selection */}
      <div className="space-y-2">
        <label className="block text-pure-white font-light text-lg">
          Theme
        </label>
        <div className="flex gap-4">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="radio"
              name="theme"
              value="dark"
              checked={theme === "dark"}
              onChange={(e) => setTheme(e.target.value)}
              className="w-4 h-4"
            />
            <span className="text-pure-white">Dark</span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="radio"
              name="theme"
              value="light"
              checked={theme === "light"}
              onChange={(e) => setTheme(e.target.value)}
              className="w-4 h-4"
            />
            <span className="text-pure-white">Light</span>
          </label>
        </div>
        <p className="text-greyish-blue text-sm">
          Theme customization coming soon
        </p>
      </div>

      {/* Message Display */}
      {message && (
        <div
          className={`p-4 rounded-md ${
            message.type === "success"
              ? "bg-green-900/30 text-green-400 border border-green-700"
              : "bg-red-900/30 text-red-400 border border-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="px-6 py-3 bg-red text-pure-white rounded-md hover:bg-pure-white hover:text-dark-blue transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-light"
      >
        {isLoading ? "Saving..." : "Save Preferences"}
      </button>
    </form>
  );
}
