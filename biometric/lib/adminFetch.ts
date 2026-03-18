import { cookies, headers } from "next/headers";

function getBaseUrl() {
  const headerStore = headers();
  const host =
    headerStore.get("x-forwarded-host") ?? headerStore.get("host");
  const proto =
    headerStore.get("x-forwarded-proto") ??
    (host?.includes("localhost") ? "http" : "https");

  if (!host) {
    return "http://localhost:3000";
  }

  return `${proto}://${host}`;
}

export async function adminFetch(path: string) {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;
  const baseUrl = getBaseUrl();

  return fetch(`${baseUrl}${path}`, {
    method: "GET",
    headers: session
      ? {
          Authorization: `Bearer ${session}`,
          Cookie: `session=${session}`,
        }
      : undefined,
    cache: "no-store",
  });
}
