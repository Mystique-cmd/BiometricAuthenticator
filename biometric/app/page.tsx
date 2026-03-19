import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.2),_transparent_55%)]" />
        <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-zinc-900/80 via-zinc-950/20 to-zinc-950" />
        <div className="relative mx-auto flex max-w-6xl flex-col gap-12 px-6 pb-16 pt-14">
          <header className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300/90">
                Biometric Authentication
              </p>
              <h1 className="text-4xl font-semibold leading-tight text-white sm:text-5xl">
                High-assurance identity checks for every session.
              </h1>
              <p className="text-base text-zinc-300">
                Authenticate customers and administrators with WebAuthn-backed
                biometrics, encrypted templates, and role-aware access. Each
                session is cryptographically verified before privileges are
                granted.
              </p>
              <div className="flex flex-wrap gap-2 text-xs uppercase tracking-wide text-zinc-400">
                {[
                  "FIDO2/WebAuthn",
                  "AES-256 at rest",
                  "JWT session integrity",
                ].map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-zinc-800 bg-zinc-900/70 px-3 py-1"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 backdrop-blur">
              <p className="text-sm font-semibold text-white">
                Get started securely
              </p>
              <p className="text-sm text-zinc-300">
                Enroll a device-bound credential, then access dashboards with
                biometric-first verification.
              </p>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Link
                  className="inline-flex items-center justify-center rounded-md bg-cyan-400 px-4 py-2 text-sm font-semibold text-zinc-900 transition hover:bg-cyan-300"
                  href="/register"
                >
                  Register Now
                </Link>
                <Link
                  className="inline-flex items-center justify-center rounded-md border border-zinc-700 px-4 py-2 text-sm font-semibold text-white transition hover:border-zinc-500 hover:text-zinc-100"
                  href="/login"
                >
                  Go to Login
                </Link>
              </div>
            </div>
          </header>

          <section className="grid gap-6 md:grid-cols-3">
            {[
              {
                title: "Multi-factor confidence",
                body: "Combine fingerprint, facial, and device signals to confirm identity in real time.",
              },
              {
                title: "Role-based dashboards",
                body: "Deliver tailored experiences for customers, staff, and administrators with scoped access.",
              },
              {
                title: "Audit-ready trails",
                body: "Every authentication event is logged with time, method, and risk context for compliance.",
              },
            ].map((card) => (
              <div
                key={card.title}
                className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 shadow-[0_20px_60px_-40px_rgba(0,0,0,0.6)]"
              >
                <h2 className="text-lg font-semibold text-white">
                  {card.title}
                </h2>
                <p className="mt-3 text-sm text-zinc-300">{card.body}</p>
              </div>
            ))}
          </section>

          <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-3xl border border-zinc-800 bg-gradient-to-br from-zinc-900 via-zinc-950 to-zinc-950 p-8">
              <h2 className="text-2xl font-semibold text-white">
                Built for regulated environments
              </h2>
              <p className="mt-3 text-sm text-zinc-300">
                The biometric system encrypts templates at rest, verifies
                credential liveness before issuing sessions, and flags anomalies
                automatically. Administrators can monitor trends, approve
                escalations, and export audit logs at any time.
              </p>
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                {[
                  { label: "99.9%", helper: "Verification accuracy" },
                  { label: "350ms", helper: "Average response time" },
                  { label: "24/7", helper: "Continuous monitoring" },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-2xl bg-zinc-900/70 p-4"
                  >
                    <p className="text-xl font-semibold text-white">
                      {stat.label}
                    </p>
                    <p className="text-xs uppercase tracking-wide text-zinc-400">
                      {stat.helper}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-8">
              <h3 className="text-lg font-semibold text-white">
                Enrollment flow
              </h3>
              <ol className="mt-4 space-y-4 text-sm text-zinc-300">
                <li className="flex gap-3">
                  <span className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-cyan-400 text-xs font-semibold text-zinc-900">
                    1
                  </span>
                  Capture biometrics and confirm account details.
                </li>
                <li className="flex gap-3">
                  <span className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-cyan-400 text-xs font-semibold text-zinc-900">
                    2
                  </span>
                  Verify liveness and encrypt the template.
                </li>
                <li className="flex gap-3">
                  <span className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-cyan-400 text-xs font-semibold text-zinc-900">
                    3
                  </span>
                  Issue a session and route to the right dashboard.
                </li>
              </ol>
              <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-950 p-4 text-xs text-zinc-400">
                Seamless for users, strict for attackers. The system adapts to
                device risk and environment anomalies automatically.
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
