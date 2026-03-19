import { NextResponse } from "next/server";
import { User } from "@/models/user";
import dbConnect from "@/lib/db";
import { AuthenticatorType } from "@/models/authenticator";
import type { WebAuthnCredential } from "@simplewebauthn/server";
import { consumeChallenge } from "@/lib/auth/challenges";
import { verifyAuthentication } from "@/lib/auth/webauthn";
import { issueJwt } from "@/lib/auth/jwt";
import { parseJson, loginVerifySchema } from "@/lib/auth/validators";
import { AuditLog } from "@/models/auditLog";

export async function POST(req: Request) {
  try {
    const { email, credential, fingerprintTemplate } = await parseJson(
      req,
      loginVerifySchema,
    );

    await dbConnect();

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { error: "Unable to verify login" },
        { status: 400 },
      );
    }

    const authenticator = user.authenticators.find(
      (auth: AuthenticatorType) =>
        auth.credentialID.toString("base64url") === credential.id,
    );

    if (!authenticator) {
      return NextResponse.json(
        { error: "Unable to verify login" },
        { status: 400 },
      );
    }

    const challenge = await consumeChallenge(email, "login");
    if (!challenge) {
      return NextResponse.json(
        { error: "Unable to verify login" },
        { status: 400 },
      );
    }
    if (challenge.expiresAt.getTime() < Date.now()) {
      return NextResponse.json(
        { error: "Login challenge expired" },
        { status: 400 },
      );
    }

    const credentialForVerification: WebAuthnCredential = {
      id: authenticator.credentialID.toString("base64url"),
      publicKey: Uint8Array.from(authenticator.credentialPublicKey),
      counter: authenticator.counter,
    };

    let verification;
    try {
      verification = await verifyAuthentication(
        credential,
        challenge.challenge,
        credentialForVerification,
        {
          expectedOrigin: challenge.origin,
          expectedRPID: challenge.rpId,
        },
      );
    } catch (error: unknown) {
      console.error("WebAuthn verification failed:", error);
      const message = error instanceof Error ? error.message : "Unknown error";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    if (verification.verified) {
      // If a fingerprint template was provided, perform matching
      if (fingerprintTemplate) {
        if (!authenticator.isBiometric || !authenticator.fingerprintTemplate) {
          return NextResponse.json(
            {
              error:
                "Provided authenticator is not configured for fingerprint matching",
            },
            { status: 400 },
          );
        }

        const submittedFingerprintBuffer = Buffer.from(
          fingerprintTemplate,
          "base64",
        );
        const storedFingerprintBuffer = authenticator.fingerprintTemplate;

        // Placeholder for actual biometric matching logic
        // In a real-world scenario, this would involve a specialized library
        // or algorithm to compare fingerprint templates, returning a similarity score.
        // For this task, we assume a direct byte-to-byte comparison is sufficient.
        if (!submittedFingerprintBuffer.equals(storedFingerprintBuffer)) {
          return NextResponse.json(
            { error: "Fingerprint template does not match" },
            { status: 400 },
          );
        }
      }

      // Security update: update the counter to prevent replay attacks
      authenticator.counter = verification.authenticationInfo.newCounter;
      await user.save();

      const token = issueJwt({
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
        authMethod: "webauthn",
      });

      try {
        await AuditLog.create({
          userId: user._id,
          action: "User Login",
          status: "Success",
          details: { method: "webauthn" },
        });
      } catch (error: unknown) {
        console.error("Audit log failure:", error);
      }

      const response = NextResponse.json({ verified: true, token });
      response.cookies.set("session", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
      });

      return response;
    }

    return NextResponse.json({ verified: false }, { status: 400 });
  } catch (error: unknown) {
    const status =
      error instanceof Error && error.message === "Invalid request"
        ? 400
        : 500;
    return NextResponse.json({ error: "Unable to verify login" }, { status });
  }
}
