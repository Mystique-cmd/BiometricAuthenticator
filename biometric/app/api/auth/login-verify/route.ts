import { NextResponse } from "next/server";
import { User } from "@/models/user";
import dbConnect from "@/lib/db";
import { parseJson, loginVerifySchema } from "@/lib/auth/validators";
import { consumeChallenge } from "@/lib/auth/challenges";
import { verifyAuthentication } from "@/lib/auth/webauthn";
import { issueJwt } from "@/lib/auth/jwt";

export async function POST(req: Request) {
  try {
    const { email, credential } = await parseJson(req, loginVerifySchema);
    await dbConnect();

    const user = await User.findOne({ email });
    if (!user) {
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

    const authenticators = user.authenticators as Array<{
      credentialID: Buffer;
      credentialPublicKey: Buffer;
      counter: number;
    }>;
    const authenticator = authenticators.find((auth) => {
      return auth.credentialID.toString("base64url") === credential.id;
    });

    if (!authenticator) {
      return NextResponse.json(
        { error: "Unable to verify login" },
        { status: 400 },
      );
    }

    const verification = await verifyAuthentication(
      credential,
      challenge.challenge,
      {
        id: authenticator.credentialID.toString("base64url"),
        publicKey: new Uint8Array(authenticator.credentialPublicKey),
        counter: authenticator.counter,
      },
    );

    if (verification.verified) {
      // Security update: update the counter to prevent replay attacks
      authenticator.counter = verification.authenticationInfo.newCounter;
      await user.save();

      const token = issueJwt({
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
        authMethod: "webauthn",
      });

      const response = NextResponse.json({ verified: true });
      response.cookies.set("session", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
      });

      return response;
    }

    return NextResponse.json({ verified: false }, { status: 400 });
  } catch {
    return NextResponse.json(
      { error: "Unable to verify login" },
      { status: 500 },
    );
  }
}
