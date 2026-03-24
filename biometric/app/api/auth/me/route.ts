import { NextResponse } from "next/server";
import { verifyJwt } from "@/lib/auth/jwt";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies(); // Await cookies() to get the actual cookie store
    const sessionCookie = cookieStore.get("session");

    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = sessionCookie.value;
    const decoded = await verifyJwt(token);

    if (!decoded || !decoded.role) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({ role: decoded.role });
  } catch (error) {
    console.error("Error in /api/auth/me:", error);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
