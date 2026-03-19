"use client";

import AuthPanel from "@/components/AuthPanel";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-zinc-50 px-6 py-12">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-8">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Biometric Authenticator
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-zinc-900">
            Secure access with biometric-first login
          </h1>
          <p className="mt-2 text-sm text-zinc-600">
            Use fingerprint login when available. Password fallback is enabled
            only if WebAuthn is unsupported.
          </p>
        </div>

        <AuthPanel initialMode="login" />
      </div>
    </div>
  );
}
