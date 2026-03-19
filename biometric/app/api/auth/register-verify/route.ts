import { NextResponse } from "next/server";
import { User } from "@/models/user";
import dbConnect from "@/lib/db";
import { consumeChallenge } from "@/lib/auth/challenges";
import { verifyRegistration } from "@/lib/auth/webauthn";
import { parseJson, registerVerifySchema } from "@/lib/auth/validators";
import { hashPassword } from "@/lib/auth/password";
import { AuditLog } from "@/models/auditLog";

export async function POST(req: Request) {
  try {
    const {
      email,
      password,
      credential,
      fingerprintTemplate,
      description,
      isBiometric,
    } = await parseJson(req, registerVerifySchema);

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
    if (challenge.expiresAt.getTime() < Date.now()) {
      return NextResponse.json(
        { error: "Registration challenge expired" },
        { status: 400 },
      );
    }

    const verification = await verifyRegistration(
      credential,
      challenge.challenge,
      {
        expectedOrigin: challenge.origin,
        expectedRPID: challenge.rpId,
      },
    );

    if (verification.verified && verification.registrationInfo) {
      const registrationCredential = verification.registrationInfo.credential;
      const credentialIdBytes =
        typeof registrationCredential.id === "string"
          ? Buffer.from(registrationCredential.id, "base64url")
          : Buffer.from(registrationCredential.id);
      const publicKeyBytes = Buffer.from(registrationCredential.publicKey);

      const newAuthenticator = {
        credentialID: credentialIdBytes,
        credentialPublicKey: publicKeyBytes,
        counter: registrationCredential.counter,
        credentialDeviceType:
          verification.registrationInfo.credentialDeviceType ?? "singleDevice",
        credentialBackedUp:
          verification.registrationInfo.credentialBackedUp ?? false,
      };

      if (fingerprintTemplate) {
        (newAuthenticator as { fingerprintTemplate?: Buffer }).fingerprintTemplate =
          Buffer.from(fingerprintTemplate, "base64");
        (newAuthenticator as { isBiometric?: boolean }).isBiometric = true;
      }
      if (description) {
        (newAuthenticator as { description?: string }).description = description;
      }
      if (isBiometric !== undefined) {
        (newAuthenticator as { isBiometric?: boolean }).isBiometric =
          isBiometric;
      }

      user.authenticators.push(newAuthenticator);

      if (password) {
        user.password = await hashPassword(password);
      }

      await user.save();

      try {
        await AuditLog.create({
          userId: user._id,
          action: "Authenticator Added",
          status: "Success",
          details: { method: "webauthn", isBiometric: !!fingerprintTemplate },
        });
      } catch (error: unknown) {
        console.error("Audit log failure:", error);
      }

      return NextResponse.json({ verified: true });
    }

    return NextResponse.json({ verified: false }, { status: 400 });
  } catch (error: unknown) {
    const status =
      error instanceof Error && error.message === "Invalid request"
        ? 400
        : 500;
    return NextResponse.json(
      { error: "Unable to verify registration" },
      { status },
    );
  }
}
