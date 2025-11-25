import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { z } from "zod";

// Zod validation schema
const signupSchema = z
  .object({
    email: z.string().email("Please enter a valid email address"),
    name: z.string().optional(),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(100, "Password is too long"),
    passwordRepeat: z.string(),
  })
  .refine((data) => data.password === data.passwordRepeat, {
    message: "Passwords don't match",
    path: ["passwordRepeat"],
  });

type SignupFormData = z.infer<typeof signupSchema>;

export function SignupForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordRepeat, setPasswordRepeat] = useState("");
  const [name, setName] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    // Validate with Zod
    const validation = signupSchema.safeParse({
      email,
      password,
      passwordRepeat,
      name,
    });

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
      await authClient.signUp.email({
        email: validation.data.email,
        password: validation.data.password,
        name:
          validation.data.name?.trim() || validation.data.email.split("@")[0],
      });

      // Redirect to home page on success
      window.location.href = "/";
    } catch (err: any) {
      setErrors({ general: err.message || "Failed to create account" });
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
        Sign Up
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
          type="text"
          placeholder="Name (optional)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-transparent border-b border-greyish-blue pb-4 text-pure-white placeholder:text-pure-white/50 focus:border-pure-white outline-none transition-colors"
        />
        {errors.name && <p className="text-red text-sm mt-1">{errors.name}</p>}
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

      <div>
        <input
          type="password"
          placeholder="Repeat Password"
          value={passwordRepeat}
          onChange={(e) => setPasswordRepeat(e.target.value)}
          required
          className="w-full bg-transparent border-b border-greyish-blue pb-4 text-pure-white placeholder:text-pure-white/50 focus:border-pure-white outline-none transition-colors"
        />
        {errors.passwordRepeat && (
          <p className="text-red text-sm mt-1">{errors.passwordRepeat}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="bg-red hover:bg-pure-white hover:text-dark-blue text-pure-white py-3 rounded-md font-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Creating account..." : "Create an account"}
      </button>

      <p className="text-center text-pure-white">
        Already have an account?{" "}
        <a href="/login" className="text-red hover:underline">
          Login
        </a>
      </p>
    </form>
  );
}
