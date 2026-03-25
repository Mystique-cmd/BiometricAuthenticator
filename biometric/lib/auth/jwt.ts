import {
  sign,
  type SignOptions,
  verify,
  type JwtPayload,
} from "jsonwebtoken";

const JWT_TTL = (process.env.JWT_TTL ?? "1h") as SignOptions["expiresIn"];

export type AuthMethod = "webauthn" | "password";
type DecodedJwt = JwtPayload & {
  email?: string;
  role?: string;
  authMethod?: AuthMethod;
};

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

export async function verifyJwt(token: string): Promise<DecodedJwt> {
  const JWT_SECRET = process.env.JWT_SECRET;
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is required");
  }
  return new Promise<DecodedJwt>((resolve, reject) => {
    verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        return reject(err);
      }
      if (!decoded || typeof decoded === "string") {
        return reject(new Error("Invalid token payload"));
      }
      resolve(decoded as DecodedJwt);
    });
  });
}

