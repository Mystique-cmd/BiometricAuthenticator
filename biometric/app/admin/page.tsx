import Link from "next/link";
import { getSession } from "@/lib/auth/session";

const page = async () => {
  const session = await getSession();

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-semibold text-zinc-900">
          Admin Console Overview
        </h2>
        <p className="mt-2 text-sm text-zinc-600">
          Manage users, audit security events, and monitor biometric activity.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-zinc-900">Session</h3>
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
          <h3 className="text-lg font-semibold text-zinc-900">Quick Links</h3>
          <ul className="mt-3 space-y-2 text-sm text-zinc-700">
            <li>
              <Link
                className="text-zinc-900 hover:underline"
                href="/admin/user-management"
              >
                Review registered users
              </Link>
            </li>
            <li>
              <Link
                className="text-zinc-900 hover:underline"
                href="/admin/alerts"
              >
                Investigate alerts
              </Link>
            </li>
            <li>
              <Link
                className="text-zinc-900 hover:underline"
                href="/admin/audit-logs"
              >
                Inspect audit logs
              </Link>
            </li>
            <li>
              <Link
                className="text-zinc-900 hover:underline"
                href="/admin/biometric-template-management"
              >
                Manage biometric templates
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default page;
