import { sign, type SignOptions } from "jsonwebtoken";

const JWT_TTL = (process.env.JWT_TTL ?? "1h") as SignOptions["expiresIn"];

export type AuthMethod = "webauthn" | "password";

export function issueJwt(payload: {
  userId: string;
  email: string;
  role: string;
  authMethod: AuthMethod;
}) {
  const JWT_SECRET = process.env.JWT_SECRET;
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is required");
  }

  return sign(
    {
      sub: payload.userId,
      email: payload.email,
      role: payload.role,
      authMethod: payload.authMethod,
    },
    JWT_SECRET,
    { expiresIn: JWT_TTL },
  );
}
