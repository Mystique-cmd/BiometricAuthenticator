import { getSession } from "@/lib/auth/session";

export default async function DashboardPage() {
  const session = await getSession();

  return (
    <div className="min-h-screen bg-zinc-50 px-6 py-10">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-semibold text-zinc-900">
            User Dashboard
          </h1>
          <p className="text-sm text-zinc-600">
            Overview of your account and recent authentication activity.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-zinc-900">Session</h2>
            {session ? (
              <div className="mt-3 space-y-2 text-sm text-zinc-700">
                <p>
                  <span className="font-medium text-zinc-900">User:</span>{" "}
                  {session.email}
                </p>
                <p>
                  <span className="font-medium text-zinc-900">Role:</span>{" "}
                  {session.role}
                </p>
                <p>
                  <span className="font-medium text-zinc-900">Method:</span>{" "}
                  {session.authMethod}
                </p>
              </div>
            ) : (
              <p className="mt-3 text-sm text-zinc-600">
                No session found. Please log in.
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-zinc-900">
              Quick Actions
            </h2>
            <ul className="mt-3 space-y-2 text-sm text-zinc-700">
              <li>Review recent login attempts</li>
              <li>Manage biometric authenticators</li>
              <li>Update contact information</li>
            </ul>
            <p className="mt-3 text-xs text-zinc-500">
              These sections can be wired to API endpoints when ready.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-zinc-900">
            Activity Feed
          </h2>
          <p className="mt-2 text-sm text-zinc-600">
            No activity to display yet.
          </p>
        </div>
      </div>
    </div>
  );
}
