import { adminFetch } from "@/lib/adminFetch";

type AlertRow = {
  _id: string;
  message: string;
  type: string;
  severity: string;
  resolved: boolean;
  timestamp: string;
  userId?: { name?: string; email?: string };
};

export default async function page() {
  const res = await adminFetch("/api/admin/alerts");
  const json = res.ok ? await res.json() : null;
  const alerts = (json?.data as AlertRow[]) ?? [];

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-semibold text-zinc-900">Alerts</h2>
        <p className="mt-2 text-sm text-zinc-600">
          Monitor system alerts and security signals.
        </p>
      </div>

      {!res.ok && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Unable to load alerts.
        </div>
      )}

      <div className="space-y-3">
        {alerts.length === 0 ? (
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-600 shadow-sm">
            No alerts found.
          </div>
        ) : (
          alerts.map((alert) => (
            <div
              key={alert._id}
              className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-zinc-900">
                    {alert.message}
                  </p>
                  <p className="mt-1 text-xs text-zinc-500">
                    {alert.userId?.email ?? "Unknown user"}
                  </p>
                </div>
                <div className="text-xs text-zinc-600">
                  {alert.timestamp
                    ? new Date(alert.timestamp).toLocaleString()
                    : "-"}
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                <span className="rounded-full bg-zinc-100 px-2 py-1 text-zinc-700">
                  {alert.type}
                </span>
                <span className="rounded-full bg-zinc-100 px-2 py-1 text-zinc-700">
                  {alert.severity}
                </span>
                <span className="rounded-full bg-zinc-100 px-2 py-1 text-zinc-700">
                  {alert.resolved ? "Resolved" : "Open"}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
