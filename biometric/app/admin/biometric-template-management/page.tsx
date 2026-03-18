import { adminFetch } from "@/lib/adminFetch";

type TemplateRow = {
  _id: string;
  userId: string;
  userName: string;
  userEmail: string;
  counter: number;
  credentialDeviceType: string;
  credentialBackedUp: boolean;
};

export default async function page() {
  const res = await adminFetch("/api/admin/biometric-templates");
  const json = res.ok ? await res.json() : null;
  const templates = (json?.data as TemplateRow[]) ?? [];

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-semibold text-zinc-900">
          Biometric Templates
        </h2>
        <p className="mt-2 text-sm text-zinc-600">
          View registered authenticators and device metadata.
        </p>
      </div>

      {!res.ok && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Unable to load biometric templates.
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-50 text-zinc-600">
            <tr>
              <th className="px-4 py-3 font-medium">User</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Device Type</th>
              <th className="px-4 py-3 font-medium">Backed Up</th>
              <th className="px-4 py-3 font-medium">Counter</th>
            </tr>
          </thead>
          <tbody>
            {templates.length === 0 ? (
              <tr>
                <td
                  className="px-4 py-6 text-center text-zinc-500"
                  colSpan={5}
                >
                  No biometric templates found.
                </td>
              </tr>
            ) : (
              templates.map((row) => (
                <tr key={row._id} className="border-t border-zinc-200">
                  <td className="px-4 py-3 font-medium text-zinc-900">
                    {row.userName}
                  </td>
                  <td className="px-4 py-3 text-zinc-700">{row.userEmail}</td>
                  <td className="px-4 py-3 text-zinc-700">
                    {row.credentialDeviceType}
                  </td>
                  <td className="px-4 py-3 text-zinc-700">
                    {row.credentialBackedUp ? "Yes" : "No"}
                  </td>
                  <td className="px-4 py-3 text-zinc-700">{row.counter}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
