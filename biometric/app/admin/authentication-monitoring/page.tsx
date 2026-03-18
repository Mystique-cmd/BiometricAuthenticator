import { adminFetch } from "@/lib/adminFetch";

type AuthLogRow = {
  _id: string;
  action: string;
  status: string;
  timestamp: string;
  userId?: { name?: string; email?: string };
};

export default async function page() {
  const res = await adminFetch("/api/admin/auth-monitoring");
  const json = res.ok ? await res.json() : null;
  const logs = (json?.data as AuthLogRow[]) ?? [];

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-semibold text-zinc-900">
          Authentication Monitoring
        </h2>
        <p className="mt-2 text-sm text-zinc-600">
          Focused feed of authentication-related events.
        </p>
      </div>

      {!res.ok && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Unable to load authentication logs.
        </div>
      )}

      <div className="space-y-3">
        {logs.length === 0 ? (
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-600 shadow-sm">
            No authentication events found.
          </div>
        ) : (
          logs.map((log) => (
            <div
              key={log._id}
              className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-zinc-900">
                    {log.action}
                  </p>
                  <p className="mt-1 text-xs text-zinc-500">
                    {log.userId?.email ?? "Unknown user"}
                  </p>
                </div>
                <div className="text-xs text-zinc-600">
                  {log.timestamp
                    ? new Date(log.timestamp).toLocaleString()
                    : "-"}
                </div>
              </div>
              <div className="mt-3 text-xs text-zinc-600">
                Status: {log.status}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
