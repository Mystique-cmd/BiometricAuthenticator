import { cookies } from "next/headers";
import { jwtVerify } from "jose";

export type SessionPayload = {
  sub: string;
  email: string;
  role: string;
  authMethod: "webauthn" | "password";
};

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  if (!token) return null;

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is required");
  }
  const key = new TextEncoder().encode(secret);
  const { payload } = await jwtVerify(token, key);

  return payload as SessionPayload;
}
