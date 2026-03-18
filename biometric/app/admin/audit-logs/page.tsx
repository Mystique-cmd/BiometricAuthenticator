import { adminFetch } from "@/lib/adminFetch";

type AuditRow = {
  _id: string;
  action: string;
  status: string;
  timestamp: string;
  ipAddress?: string;
  userId?: { name?: string; email?: string };
};

export default async function page() {
  const res = await adminFetch("/api/admin/audit-logs");
  const json = res.ok ? await res.json() : null;
  const logs = (json?.data as AuditRow[]) ?? [];

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-semibold text-zinc-900">Audit Logs</h2>
        <p className="mt-2 text-sm text-zinc-600">
          Track critical events across the system.
        </p>
      </div>

      {!res.ok && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Unable to load audit logs.
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-50 text-zinc-600">
            <tr>
              <th className="px-4 py-3 font-medium">Action</th>
              <th className="px-4 py-3 font-medium">User</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">IP</th>
              <th className="px-4 py-3 font-medium">Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td
                  className="px-4 py-6 text-center text-zinc-500"
                  colSpan={5}
                >
                  No audit logs found.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log._id} className="border-t border-zinc-200">
                  <td className="px-4 py-3 font-medium text-zinc-900">
                    {log.action}
                  </td>
                  <td className="px-4 py-3 text-zinc-700">
                    {log.userId?.email ?? "Unknown"}
                  </td>
                  <td className="px-4 py-3 text-zinc-700">{log.status}</td>
                  <td className="px-4 py-3 text-zinc-700">
                    {log.ipAddress ?? "-"}
                  </td>
                  <td className="px-4 py-3 text-zinc-700">
                    {log.timestamp
                      ? new Date(log.timestamp).toLocaleString()
                      : "-"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
