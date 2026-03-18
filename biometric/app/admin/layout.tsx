import Link from "next/link";
import { getSession } from "@/lib/auth/session";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  const isAdmin = session?.role === "admin";

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <div>
            <p className="text-xs font-semibold uppercase text-zinc-500">
              Admin Console
            </p>
            <h1 className="text-lg font-semibold text-zinc-900">
              Biometric Authenticator
            </h1>
          </div>
          <nav className="flex flex-wrap gap-3 text-sm text-zinc-700">
            <Link className="hover:text-zinc-900" href="/admin">
              Overview
            </Link>
            <Link className="hover:text-zinc-900" href="/admin/user-management">
              Users
            </Link>
            <Link className="hover:text-zinc-900" href="/admin/alerts">
              Alerts
            </Link>
            <Link className="hover:text-zinc-900" href="/admin/audit-logs">
              Audit Logs
            </Link>
            <Link
              className="hover:text-zinc-900"
              href="/admin/authentication-monitoring"
            >
              Auth Monitoring
            </Link>
            <Link
              className="hover:text-zinc-900"
              href="/admin/biometric-template-management"
            >
              Biometric Templates
            </Link>
            <Link className="hover:text-zinc-900" href="/admin/analytics">
              Analytics
            </Link>
          </nav>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-8">
        {!session ? (
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-zinc-900">
              Please log in
            </h2>
            <p className="mt-2 text-sm text-zinc-600">
              You must be authenticated to access the admin console.
            </p>
          </div>
        ) : !isAdmin ? (
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-zinc-900">
              Access denied
            </h2>
            <p className="mt-2 text-sm text-zinc-600">
              Your account does not have admin permissions.
            </p>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}
