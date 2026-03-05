import { NextResponse } from "next/server";
import { verifyAuthenticationResponse } from "@simplewebauthn/server";
import { User } from "@/models/user";
import dbConnect from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { email, body } = await req.json(); // 'body' is the credential from startAuthentication()
    await dbConnect();

    const user = await User.findOne({ email });
    if (!user || !user.currentChallenge) {
      return NextResponse.json(
        { error: "Login session expired" },
        { status: 400 },
      );
    }

    const authenticator = user.authenticators.find(
      (auth: any) => auth.credentialID.toString("base64url") === body.id,
    );

    if (!authenticator) {
      return NextResponse.json(
        { error: "Authenticator not recognized" },
        { status: 400 },
      );
    }

    const verification = await verifyAuthenticationResponse({
      response: body,
      expectedChallenge: user.currentChallenge,
      expectedOrigin: process.env.EXPECTED_ORIGIN || "http://localhost:3000",
      expectedRPID: process.env.RP_ID || "localhost",
      authenticator: {
        credentialID: authenticator.credentialID,
        credentialPublicKey: authenticator.credentialPublicKey,
        counter: authenticator.counter,
      },
    });

    if (verification.verified) {
      // Security update: update the counter to prevent replay attacks
      authenticator.counter = verification.authenticationInfo.newCounter;
      user.currentChallenge = undefined;
      await user.save();

      // SUCCESS:  JWT or Session Cookie
      //  const token = signToken(user._id);

      return NextResponse.json({ verified: true });
    }

    return NextResponse.json({ verified: false }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
