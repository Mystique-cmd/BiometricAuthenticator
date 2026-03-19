"use client";

import AuthPanel from "@/components/AuthPanel";

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(14,116,144,0.2),_transparent_55%)]" />
        <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-zinc-900/80 via-zinc-950/30 to-zinc-950" />
        <div className="relative mx-auto grid max-w-6xl gap-10 px-6 pb-16 pt-14 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-6">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300/90">
                Enrollment
              </p>
              <h1 className="text-4xl font-semibold leading-tight text-white sm:text-5xl">
                Create a trusted biometric identity in minutes.
              </h1>
              <p className="text-base text-zinc-300">
                Register your credential and start with biometric-first access.
              </p>
            </div>
          </div>

          <AuthPanel className="max-w-lg" initialMode="signup" />
        </div>
      </div>
    </div>
  );
}
