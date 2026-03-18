import { adminFetch } from "@/lib/adminFetch";

type AnalyticsPayload = {
  totalUsers: number;
  totalAuthenticators: number;
  alerts: {
    total: number;
    error: number;
    warning: number;
    info: number;
    success: number;
    resolved: number;
  };
  recentLoginAttempts: number;
};

export default async function page() {
  const res = await adminFetch("/api/admin/analytics");
  const json = (res.ok ? await res.json() : null) as AnalyticsPayload | null;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-semibold text-zinc-900">Analytics</h2>
        <p className="mt-2 text-sm text-zinc-600">
          High-level statistics for the platform.
        </p>
      </div>

      {!res.ok && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Unable to load analytics.
        </div>
      )}

      {json && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase text-zinc-500">
              Total Users
            </p>
            <p className="mt-2 text-3xl font-semibold text-zinc-900">
              {json.totalUsers}
            </p>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase text-zinc-500">
              Authenticators
            </p>
            <p className="mt-2 text-3xl font-semibold text-zinc-900">
              {json.totalAuthenticators}
            </p>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase text-zinc-500">
              Recent Logins (24h)
            </p>
            <p className="mt-2 text-3xl font-semibold text-zinc-900">
              {json.recentLoginAttempts}
            </p>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase text-zinc-500">
              Alerts Total
            </p>
            <p className="mt-2 text-3xl font-semibold text-zinc-900">
              {json.alerts.total}
            </p>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase text-zinc-500">
              Alerts Resolved
            </p>
            <p className="mt-2 text-3xl font-semibold text-zinc-900">
              {json.alerts.resolved}
            </p>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase text-zinc-500">
              Alerts Critical
            </p>
            <p className="mt-2 text-3xl font-semibold text-zinc-900">
              {json.alerts.error}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
