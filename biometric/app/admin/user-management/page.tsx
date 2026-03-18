import { adminFetch } from "@/lib/adminFetch";

type UserRow = {
  _id: string;
  name: string;
  email: string;
  phoneNumber: string;
  role: string;
  nationalID: number;
  accountNumber: string;
  createdAt: string;
};

export default async function page() {
  const res = await adminFetch("/api/admin/users");
  const json = res.ok ? await res.json() : null;
  const users = (json?.data as UserRow[]) ?? [];

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-semibold text-zinc-900">Users</h2>
        <p className="mt-2 text-sm text-zinc-600">
          Manage registered users and review roles.
        </p>
      </div>

      {!res.ok && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Unable to load users.
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-50 text-zinc-600">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Phone</th>
              <th className="px-4 py-3 font-medium">Account</th>
              <th className="px-4 py-3 font-medium">Created</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td
                  className="px-4 py-6 text-center text-zinc-500"
                  colSpan={6}
                >
                  No users found.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user._id} className="border-t border-zinc-200">
                  <td className="px-4 py-3 font-medium text-zinc-900">
                    {user.name}
                  </td>
                  <td className="px-4 py-3 text-zinc-700">{user.email}</td>
                  <td className="px-4 py-3 text-zinc-700">{user.role}</td>
                  <td className="px-4 py-3 text-zinc-700">
                    {user.phoneNumber}
                  </td>
                  <td className="px-4 py-3 text-zinc-700">
                    {user.accountNumber}
                  </td>
                  <td className="px-4 py-3 text-zinc-700">
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString()
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
