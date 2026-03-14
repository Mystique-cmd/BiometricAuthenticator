import { NextResponse } from "next/server";
import { User } from "@/models/user";
import dbConnect from "@/lib/db";
import { parseJson, registerVerifySchema } from "@/lib/auth/validators";
import { consumeChallenge } from "@/lib/auth/challenges";
import { verifyRegistration } from "@/lib/auth/webauthn";
import { hashPassword, verifyPassword } from "@/lib/auth/password";

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

    const verification = await verifyRegistration(
      credential,
      challenge.challenge,
    );

    if (verification.verified && verification.registrationInfo) {
      const { credential } = verification.registrationInfo;

      user.authenticators.push({
        credentialID: Buffer.from(credential.id),
        credentialPublicKey: Buffer.from(credential.publicKey),
        counter: credential.counter,
        credentialDeviceType: verification.registrationInfo.credentialType,
        credentialBackedUp: verification.registrationInfo.credentialBackedUp,
      });

      await user.save();

      return NextResponse.json({ verified: true });
    }

    return NextResponse.json({ verified: false }, { status: 400 });
  } catch {
    return NextResponse.json(
      { error: "Unable to verify registration" },
      { status: 500 },
    );
  }
}
