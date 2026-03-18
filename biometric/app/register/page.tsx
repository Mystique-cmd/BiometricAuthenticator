"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RegisterPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formState, setFormState] = useState({
    name: "",
    phoneNumber: "",
    email: "",
    nationalID: "",
    accountNumber: "",
    password: "",
    role: "customer",
  });

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/register-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formState.name,
          phoneNumber: formState.phoneNumber,
          email: formState.email,
          nationalID: Number(formState.nationalID),
          accountNumber: formState.accountNumber,
          password: formState.password,
          role: formState.role,
        }),
      });

      if (!response.ok) {
        setError("Unable to create account. Please check your details.");
        return;
      }

      router.push("/");
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 px-6 py-12">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Registration
            </p>
            <h1 className="text-2xl font-semibold text-zinc-900">
              Create your biometric account
            </h1>
            <p className="text-sm text-zinc-600">
              Fill in your details. The selected role will be stored in the
              database and used for access control.
            </p>
          </div>

          <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
            <label className="block text-sm text-zinc-700">
              Full name
              <input
                className="mt-2 w-full rounded-md border border-zinc-200 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-400"
                name="name"
                value={formState.name}
                onChange={handleChange}
                placeholder="Jane Doe"
                required
              />
            </label>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="block text-sm text-zinc-700">
                Phone number
                <input
                  className="mt-2 w-full rounded-md border border-zinc-200 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-400"
                  name="phoneNumber"
                  value={formState.phoneNumber}
                  onChange={handleChange}
                  placeholder="0712345678"
                  required
                />
              </label>
              <label className="block text-sm text-zinc-700">
                Email
                <input
                  className="mt-2 w-full rounded-md border border-zinc-200 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-400"
                  type="email"
                  name="email"
                  value={formState.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  required
                />
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="block text-sm text-zinc-700">
                National ID
                <input
                  className="mt-2 w-full rounded-md border border-zinc-200 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-400"
                  name="nationalID"
                  value={formState.nationalID}
                  onChange={handleChange}
                  placeholder="12345678"
                  required
                />
              </label>
              <label className="block text-sm text-zinc-700">
                Account number
                <input
                  className="mt-2 w-full rounded-md border border-zinc-200 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-400"
                  name="accountNumber"
                  value={formState.accountNumber}
                  onChange={handleChange}
                  placeholder="000123456789"
                  required
                />
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="block text-sm text-zinc-700">
                Password
                <input
                  className="mt-2 w-full rounded-md border border-zinc-200 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-400"
                  type="password"
                  name="password"
                  value={formState.password}
                  onChange={handleChange}
                  placeholder="At least 6 characters"
                  required
                />
              </label>
              <label className="block text-sm text-zinc-700">
                Role
                <select
                  className="mt-2 w-full rounded-md border border-zinc-200 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-400"
                  name="role"
                  value={formState.role}
                  onChange={handleChange}
                >
                  <option value="customer">Customer</option>
                  <option value="admin">Admin</option>
                </select>
              </label>
            </div>

            {error ? (
              <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
                {error}
              </p>
            ) : null}

            <div className="flex flex-wrap items-center gap-3">
              <button
                className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-zinc-400"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating account..." : "Create account"}
              </button>
              <a
                className="text-sm text-zinc-600 hover:text-zinc-900"
                href="/"
              >
                Back to login
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
