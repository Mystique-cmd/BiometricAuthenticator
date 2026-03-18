"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/login-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          webauthnUnsupported: true,
        }),
      });

      if (!response.ok) {
        setError("Unable to log in. Please check your details.");
        return;
      }

      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 px-6 py-12">
      <div className="mx-auto grid max-w-5xl items-center gap-10 lg:grid-cols-2">
        <div className="space-y-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Biometric Authenticator
            </p>
            <h1 className="mt-3 text-3xl font-semibold text-zinc-900">
              Secure access for customers and admins
            </h1>
          </div>
          <p className="text-sm text-zinc-600">
            Sign in to continue. Your account role determines the dashboard
            experience. We verify credentials against the database and issue a
            role-aware session token.
          </p>
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-600 shadow-sm">
            <p className="font-semibold text-zinc-900">
              Don&apos;t have an account?
            </p>
            <p className="mt-2">
              Create one to register your biometric credentials and select the
              right access level.
            </p>
            <a
              className="mt-4 inline-flex items-center rounded-md bg-zinc-900 px-4 py-2 text-white"
              href="/register"
            >
              Go to Registration
            </a>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
          <h2 className="text-xl font-semibold text-zinc-900">Log in</h2>
          <p className="mt-2 text-sm text-zinc-600">
            Use your email and password to access the platform.
          </p>
          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <label className="block text-sm text-zinc-700">
              Email
              <input
                className="mt-2 w-full rounded-md border border-zinc-200 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-400"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="name@example.com"
                required
              />
            </label>
            <label className="block text-sm text-zinc-700">
              Password
              <input
                className="mt-2 w-full rounded-md border border-zinc-200 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-400"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                required
              />
            </label>
            {error ? (
              <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
                {error}
              </p>
            ) : null}
            <button
              className="w-full rounded-md bg-zinc-900 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-zinc-400"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
