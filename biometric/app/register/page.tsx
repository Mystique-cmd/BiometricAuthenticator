"use client";

import AuthPanel from "@/components/AuthPanel";

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-zinc-50 px-6 py-12">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-8">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Registration
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-zinc-900">
            Create your biometric account
          </h1>
          <p className="mt-2 text-sm text-zinc-600">
            Enrollment uses WebAuthn. Passwords are stored for fallback access.
          </p>
        </div>

        <AuthPanel initialMode="signup" />
      </div>
    </div>
  );
}
