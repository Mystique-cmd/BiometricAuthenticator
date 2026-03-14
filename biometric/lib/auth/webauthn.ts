import {
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
} from "@simplewebauthn/server";
import type {
  AuthenticatorTransportFuture,
  WebAuthnCredential,
} from "@simplewebauthn/server";
import { isoUint8Array } from "@simplewebauthn/server/helpers";
import { getRpConfig } from "@/lib/auth/config";

function normalizeTransports(
  transports?: string[],
): AuthenticatorTransportFuture[] | undefined {
  if (!transports) return undefined;
  const allowed: AuthenticatorTransportFuture[] = [
    "ble",
    "cable",
    "hybrid",
    "internal",
    "nfc",
    "smart-card",
    "usb",
  ];
  return transports.filter((value): value is AuthenticatorTransportFuture =>
    allowed.includes(value as AuthenticatorTransportFuture),
  );
}

export function buildRegistrationOptions(user: {
  _id: string;
  email: string;
  name: string;
  authenticators: Array<{
    credentialID: Buffer;
    transports?: string[];
  }>;
}) {
  const { rpId, rpName } = getRpConfig();

  return generateRegistrationOptions({
    rpName,
    rpID: rpId,
    userID: isoUint8Array.fromASCIIString(user._id),
    userName: user.email,
    userDisplayName: user.name,
    attestationType: "none",
    excludeCredentials: user.authenticators.map((auth) => ({
      id: auth.credentialID.toString("base64url"),
      type: "public-key",
      transports: normalizeTransports(auth.transports),
    })),
    authenticatorSelection: {
      residentKey: "preferred",
      userVerification: "preferred",
    },
  });
}

export function buildAuthenticationOptions(user: {
  authenticators: Array<{
    credentialID: Buffer;
    transports?: string[];
  }>;
}) {
  const { rpId } = getRpConfig();

  return generateAuthenticationOptions({
    rpID: rpId,
    allowCredentials: user.authenticators.map((auth) => ({
      id: auth.credentialID.toString("base64url"),
      type: "public-key",
      transports: normalizeTransports(auth.transports),
    })),
    userVerification: "preferred",
  });
}

export async function verifyRegistration(
  credential: unknown,
  expectedChallenge: string,
) {
  const { expectedOrigin, rpId } = getRpConfig();
  return verifyRegistrationResponse({
    response: credential as Parameters<typeof verifyRegistrationResponse>[0]["response"],
    expectedChallenge,
    expectedOrigin,
    expectedRPID: rpId,
  });
}

export async function verifyAuthentication(
  credential: unknown,
  expectedChallenge: string,
  authenticator: WebAuthnCredential,
) {
  const { expectedOrigin, rpId } = getRpConfig();
  return verifyAuthenticationResponse({
    response: credential as Parameters<typeof verifyAuthenticationResponse>[0]["response"],
    expectedChallenge,
    expectedOrigin,
    expectedRPID: rpId,
    credential: authenticator,
  });
}
