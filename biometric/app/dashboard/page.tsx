import { getSession } from "@/lib/auth/session";

export default async function DashboardPage() {
  const session = await getSession();
  const displayName = session?.email?.split("@")[0] ?? "Customer";

  return (
    <div className="min-h-screen bg-[#f7f7f2] text-zinc-900">
      <div className="border-b border-emerald-900/10 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-2 text-xs text-zinc-600">
          <div className="flex items-center gap-4">
            <span className="font-medium text-emerald-800">
              Hotline +254-763-000-000
            </span>
            <span className="hidden sm:inline">Whistleblowing</span>
          </div>
          <div className="flex items-center gap-3">
            <button className="rounded-full border border-emerald-900/20 px-3 py-1 text-emerald-800">
              Kenya
            </button>
            <button className="rounded-full border border-zinc-200 px-3 py-1">
              Search
            </button>
          </div>
        </div>
      </div>

      <header className="sticky top-0 z-20 border-b border-emerald-900/10 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-900 text-white">
              E
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-800">
                Equity Bank
              </p>
              <p className="text-xs text-zinc-500">Kenya Digital Banking</p>
            </div>
          </div>
          <nav className="flex flex-wrap gap-4 text-sm text-zinc-700">
            <a className="font-semibold text-emerald-900" href="#">
              Open an Account
            </a>
            <a href="#">Pay/Send Money</a>
            <a href="#">Save/Invest</a>
            <a href="#">Borrow</a>
            <a href="#">Insure</a>
            <a href="#">Diaspora</a>
          </nav>
          <div className="flex items-center gap-3">
            <button className="rounded-full border border-emerald-900/30 px-4 py-2 text-xs font-semibold text-emerald-900">
              Log In & Manage Account
            </button>
            <button className="rounded-full bg-emerald-900 px-4 py-2 text-xs font-semibold text-white">
              Equity Online
            </button>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden border-b border-emerald-900/10 bg-gradient-to-br from-[#f5f3ea] via-white to-[#eaf7f1]">
          <div className="absolute -right-24 top-10 h-56 w-56 rounded-full bg-emerald-900/10 blur-3xl" />
          <div className="absolute -left-20 bottom-0 h-72 w-72 rounded-full bg-[#f3c35a]/20 blur-3xl" />
          <div className="mx-auto grid max-w-6xl gap-10 px-6 py-12 md:grid-cols-[1.2fr_0.8fr] md:items-center">
            <div className="space-y-5">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-700">
                Welcome back
              </p>
              <h1 className="text-3xl font-semibold leading-tight text-emerald-950 md:text-4xl">
                Hello {displayName}, manage your money with confidence.
              </h1>
              <p className="text-sm text-zinc-700 md:text-base">
                Quick access to balances, transfers, and card offers — built on
                the Equity experience you already trust.
              </p>
              <div className="flex flex-wrap gap-3">
                <button className="rounded-full bg-emerald-900 px-6 py-3 text-sm font-semibold text-white">
                  View Accounts
                </button>
                <button className="rounded-full border border-emerald-900/30 px-6 py-3 text-sm font-semibold text-emerald-900">
                  Send Money
                </button>
              </div>
              <div className="flex flex-wrap gap-6 text-xs text-zinc-600">
                <span>Biometric login: {session?.authMethod ?? "enabled"}</span>
                <span>Secure session</span>
                <span>24/7 support</span>
              </div>
            </div>
            <div className="rounded-3xl border border-emerald-900/10 bg-white p-6 shadow-xl shadow-emerald-900/5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                    Primary Account
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-emerald-950">
                    KES 128,540.25
                  </h2>
                  <p className="mt-1 text-xs text-zinc-500">Everyday Savings</p>
                </div>
                <div className="rounded-full bg-emerald-900/10 px-3 py-1 text-xs font-semibold text-emerald-900">
                  Active
                </div>
              </div>
              <div className="mt-6 grid gap-3 text-xs text-zinc-600">
                <div className="flex items-center justify-between">
                  <span>Last deposit</span>
                  <span className="font-semibold text-emerald-900">
                    KES 25,000
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Upcoming bill</span>
                  <span className="font-semibold text-zinc-900">KES 4,800</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Card spend</span>
                  <span className="font-semibold text-zinc-900">KES 12,740</span>
                </div>
              </div>
              <div className="mt-6 flex gap-2">
                <button className="flex-1 rounded-full border border-emerald-900/20 px-4 py-2 text-xs font-semibold text-emerald-900">
                  Download Statement
                </button>
                <button className="flex-1 rounded-full bg-emerald-900 px-4 py-2 text-xs font-semibold text-white">
                  New Transfer
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl gap-6 px-6 py-10 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="space-y-6">
            <div className="rounded-3xl border border-emerald-900/10 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-emerald-950">
                  Deals & Rewards
                </h2>
                <span className="text-xs text-emerald-700">
                  Explore Equity Card offers
                </span>
              </div>
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                {[
                  "Fuel & Travel cashback",
                  "Groceries + household",
                  "Dining and lifestyle",
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-emerald-900/10 bg-gradient-to-br from-white to-[#f5f3ea] p-4"
                  >
                    <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                      Offer
                    </p>
                    <p className="mt-3 text-sm font-semibold text-emerald-900">
                      {item}
                    </p>
                    <button className="mt-4 rounded-full border border-emerald-900/20 px-3 py-1 text-xs font-semibold text-emerald-900">
                      View deals
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-emerald-900/10 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-emerald-950">
                Quick Actions
              </h2>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {[
                  "Pay/Send Money",
                  "Save & Invest",
                  "Borrow",
                  "Insure",
                ].map((action) => (
                  <button
                    key={action}
                    className="rounded-2xl border border-emerald-900/10 bg-[#f7f7f2] px-4 py-3 text-left text-sm font-semibold text-emerald-900 transition hover:border-emerald-900/30"
                  >
                    {action}
                    <p className="mt-1 text-xs font-normal text-zinc-600">
                      Start in seconds
                    </p>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-emerald-900/10 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-emerald-950">
                Latest from Equity
              </h2>
              <div className="mt-5 space-y-4 text-sm text-zinc-700">
                <div className="rounded-2xl border border-emerald-900/10 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                    Newsroom
                  </p>
                  <p className="mt-2 font-semibold text-emerald-900">
                    Strategic growth update and performance highlights.
                  </p>
                </div>
                <div className="rounded-2xl border border-emerald-900/10 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                    Community
                  </p>
                  <p className="mt-2 font-semibold text-emerald-900">
                    Empowering women-led businesses with tailored solutions.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-emerald-900/10 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-emerald-950">
                Forex Exchange
              </h2>
              <p className="mt-2 text-xs text-zinc-500">
                Indicative rates for today.
              </p>
              <div className="mt-4 space-y-3 text-xs text-zinc-700">
                {[
                  ["USD/KES", "Buy 126.1", "Sell 131.4"],
                  ["GBP/KES", "Buy 168.49", "Sell 178.81"],
                  ["EUR/KES", "Buy 145.26", "Sell 155.52"],
                  ["ZAR/KES", "Buy 6.14", "Sell 9.16"],
                ].map(([pair, buy, sell]) => (
                  <div
                    key={pair}
                    className="flex items-center justify-between rounded-2xl border border-emerald-900/10 bg-[#f7f7f2] px-3 py-2"
                  >
                    <span className="font-semibold text-emerald-900">{pair}</span>
                    <span>{buy}</span>
                    <span>{sell}</span>
                  </div>
                ))}
              </div>
              <button className="mt-4 w-full rounded-full border border-emerald-900/20 px-4 py-2 text-xs font-semibold text-emerald-900">
                Open Currency Converter
              </button>
            </div>

            <div className="rounded-3xl border border-emerald-900/10 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-emerald-950">
                Service Finder
              </h2>
              <p className="mt-2 text-xs text-zinc-500">
                Branch, ATM, CDM, or Equity Agent near you.
              </p>
              <div className="mt-4 space-y-3 text-xs text-zinc-600">
                <div className="rounded-2xl border border-emerald-900/10 bg-[#f7f7f2] px-3 py-2">
                  I&apos;m looking for a Branch
                </div>
                <div className="rounded-2xl border border-emerald-900/10 bg-[#f7f7f2] px-3 py-2">
                  Near Nairobi, Kenya
                </div>
              </div>
              <button className="mt-4 w-full rounded-full bg-emerald-900 px-4 py-2 text-xs font-semibold text-white">
                Find Us
              </button>
            </div>

            <div className="rounded-3xl border border-emerald-900/10 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-emerald-950">
                Session
              </h2>
              {session ? (
                <div className="mt-4 space-y-2 text-xs text-zinc-600">
                  <p>
                    <span className="font-semibold text-emerald-900">User:</span>{" "}
                    {session.email}
                  </p>
                  <p>
                    <span className="font-semibold text-emerald-900">Role:</span>{" "}
                    {session.role}
                  </p>
                  <p>
                    <span className="font-semibold text-emerald-900">
                      Method:
                    </span>{" "}
                    {session.authMethod}
                  </p>
                </div>
              ) : (
                <p className="mt-4 text-xs text-zinc-500">
                  No session found. Please log in.
                </p>
              )}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-emerald-900/10 bg-white">
        <div className="mx-auto grid max-w-6xl gap-6 px-6 py-8 text-xs text-zinc-600 md:grid-cols-3">
          <div className="space-y-2">
            <p className="font-semibold text-emerald-900">Get in touch</p>
            <p>+254 763 000 000</p>
            <p>info@equitybank.co.ke</p>
          </div>
          <div className="space-y-2">
            <p className="font-semibold text-emerald-900">Services</p>
            <p>Open an Account</p>
            <p>Save and Invest</p>
            <p>Pay/Send Money</p>
            <p>Borrow</p>
          </div>
          <div className="space-y-2">
            <p className="font-semibold text-emerald-900">About Equity</p>
            <p>Who we are</p>
            <p>Partner with Us</p>
            <p>Investor Relations</p>
            <p>Careers</p>
          </div>
        </div>
        <div className="border-t border-emerald-900/10 px-6 py-4 text-center text-[11px] text-zinc-500">
          Equity Bank Kenya is regulated by the Central Bank of Kenya. © Equity
          Bank (Kenya) Limited 2026.
        </div>
      </footer>
    </div>
  );
}
