"use client";

import AuthPanel from "@/components/AuthPanel";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.15),_transparent_55%)]" />
        <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-zinc-900/80 via-zinc-950/30 to-zinc-950" />
        <div className="relative mx-auto grid max-w-6xl gap-10 px-6 pb-16 pt-14 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-6">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300/90">
                Secure Access
              </p>
              <h1 className="text-4xl font-semibold leading-tight text-white sm:text-5xl">
                Biometric-first login for high-assurance sessions.
              </h1>
              <p className="text-base text-zinc-300">
                Authenticate with WebAuthn credentials bound to trusted devices.
                Password fallback is only enabled when biometric verification is
                unavailable.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 text-xs uppercase tracking-wide text-zinc-400">
              {["FIDO2/WebAuthn", "Device-bound", "Session integrity"].map(
                (tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-zinc-800 bg-zinc-900/70 px-3 py-1"
                  >
                    {tag}
                  </span>
                ),
              )}
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 text-sm text-zinc-300">
              <p className="font-semibold text-white">Security posture</p>
              <p className="mt-2">
                Every login updates credential counters, issues signed JWT
                sessions, and logs audit events for monitoring.
              </p>
            </div>
          </div>

          <AuthPanel initialMode="login" />
        </div>
      </div>
    </div>
  );
}
