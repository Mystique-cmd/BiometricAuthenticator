import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

async function verifyJwt(token: string) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is required");
  }
  const key = new TextEncoder().encode(secret);
  await jwtVerify(token, key);
}

export async function proxy(req: NextRequest) {
  const token = req.cookies.get("session")?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  try {
    await verifyJwt(token);
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/", req.url));
  }
}

export const config = {
  matcher: ["/admin/:path*"],
};
