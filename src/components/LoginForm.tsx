import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { z } from "zod";

// Zod validation schema
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    // Validate with Zod
    const validation = loginSchema.safeParse({ email, password });

    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          fieldErrors[issue.path[0] as string] = issue.message;
        }
      });
      setErrors(fieldErrors);
      setLoading(false);
      return;
    }

    try {
      await authClient.signIn.email({
        email: validation.data.email,
        password: validation.data.password,
      });

      // Redirect to home page on success
      window.location.href = "/";
    } catch (err: any) {
      setErrors({
        general:
          err.message || "Failed to login. Please check your credentials.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-semi-dark-blue flex flex-col gap-4 rounded-md w-full max-w-md p-8"
    >
      <h2 className="text-xl md:text-[32px] font-light tracking-tight md:tracking-[-0.5px] mb-4 md:mb-6 text-pure-white">
        Login
      </h2>

      {errors.general && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-2 rounded">
          {errors.general}
        </div>
      )}

      <div>
        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full bg-transparent border-b border-greyish-blue pb-4 text-pure-white placeholder:text-pure-white/50 focus:border-pure-white outline-none transition-colors"
        />
        {errors.email && (
          <p className="text-red text-sm mt-1">{errors.email}</p>
        )}
      </div>

      <div>
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full bg-transparent border-b border-greyish-blue pb-4 text-pure-white placeholder:text-pure-white/50 focus:border-pure-white outline-none transition-colors"
        />
        {errors.password && (
          <p className="text-red text-sm mt-1">{errors.password}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="bg-red hover:bg-pure-white hover:text-dark-blue text-pure-white py-3 rounded-md font-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Logging in..." : "Login to your account"}
      </button>

      <p className="text-center text-pure-white">
        Don't have an account?{" "}
        <a href="/signup" className="text-red hover:underline">
          Sign Up
        </a>
      </p>
    </form>
  );
}
