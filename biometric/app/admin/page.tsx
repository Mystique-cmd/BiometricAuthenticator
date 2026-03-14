import { getSession } from "@/lib/auth/session";

const page = async () => {
  const session = await getSession();
  return (
    <div className="min-h-screen bg-zinc-50 px-6 py-10">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-semibold text-zinc-900">
            Admin Console
          </h1>
          <p className="text-sm text-zinc-600">
            JWT-protected content visible only to authenticated users.
          </p>
        </div>

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
      </div>
    </div>
  );
};

export default page;
