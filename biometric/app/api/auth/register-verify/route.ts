import { NextResponse } from "next/server";
import { User } from "@/models/user";
import dbConnect from "@/lib/db";
import { parseJson, registerVerifySchema } from "@/lib/auth/validators";
import { consumeChallenge } from "@/lib/auth/challenges";
import { verifyRegistration } from "@/lib/auth/webauthn";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { isoBase64URL } from "@simplewebauthn/server/helpers";

function toBase64Url(value: unknown): string | undefined {
  if (typeof value === "string") {
    if (isoBase64URL.isBase64URL(value)) return value;
    if (isoBase64URL.isBase64(value)) {
      const bytes = isoBase64URL.toBuffer(value, "base64");
      return isoBase64URL.fromBuffer(bytes, "base64url");
    }
    return value;
  }
  if (value instanceof Uint8Array) {
    const copy = Uint8Array.from(value);
    return isoBase64URL.fromBuffer(copy, "base64url");
  }
  if (value instanceof ArrayBuffer) {
    return isoBase64URL.fromBuffer(new Uint8Array(value));
  }
  return undefined;
}

function normalizeRegistrationCredential(input: unknown) {
  if (!input || typeof input !== "object") return input;
  const credential = input as Record<string, unknown>;
  const response = credential.response as Record<string, unknown> | undefined;

  const normalized = {
    ...credential,
    id: toBase64Url(credential.id),
    rawId: toBase64Url(credential.rawId),
    response: response
      ? {
          ...response,
          clientDataJSON: toBase64Url(response.clientDataJSON),
          attestationObject: toBase64Url(response.attestationObject),
          authenticatorData: toBase64Url(response.authenticatorData),
        }
      : response,
  };
  return normalized;
}

export async function POST(req: Request) {
  try {
    const { email, password, credential } = await parseJson(
      req,
      registerVerifySchema,
    );
    await dbConnect();

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { error: "Unable to verify registration" },
        { status: 400 },
      );
    }

    const challenge = await consumeChallenge(email, "register");
    if (!challenge) {
      return NextResponse.json(
        { error: "Unable to verify registration" },
        { status: 400 },
      );
    }

    if (user.password) {
      const matches = await verifyPassword(password, user.password);
      if (!matches) {
        return NextResponse.json(
          { error: "Unable to verify registration" },
          { status: 400 },
        );
      }
    } else {
      user.password = await hashPassword(password);
    }

    const normalizedCredential = normalizeRegistrationCredential(credential);
    const verification = await verifyRegistration(
      normalizedCredential,
      challenge.challenge,
    );

    if (verification.verified && verification.registrationInfo) {
      const { credential } = verification.registrationInfo;
      const credentialIdBytes =
        typeof credential.id === "string"
          ? isoBase64URL.toBuffer(credential.id)
          : credential.id;
      const publicKeyBytes =
        credential.publicKey instanceof Uint8Array
          ? credential.publicKey
          : new Uint8Array(credential.publicKey);

      user.authenticators.push({
        credentialID: Buffer.from(credentialIdBytes),
        credentialPublicKey: Buffer.from(publicKeyBytes),
        counter: credential.counter,
        credentialDeviceType: verification.registrationInfo.credentialType,
        credentialBackedUp: verification.registrationInfo.credentialBackedUp,
      });

      await user.save();

      return NextResponse.json({ verified: true });
    }

    return NextResponse.json({ verified: false }, { status: 400 });
  } catch (error: unknown) {
    if (process.env.NODE_ENV !== "production") {
      const message =
        error instanceof Error ? error.message : "Unable to verify registration";
      return NextResponse.json({ error: message }, { status: 500 });
    }
    return NextResponse.json(
      { error: "Unable to verify registration" },
      { status: 500 },
    );
  }
}
