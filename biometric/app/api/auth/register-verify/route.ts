import { NextResponse } from "next/server";
import { verifyRegistrationResponse } from "@simplewebauthn/server";
import { User } from "@/models/user";
import dbConnect from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { email, body } = await req.json();
    await dbConnect();

    const user = await User.findOne({ email });
    if (!user || !user.currentChallenge) {
      return NextResponse.json(
        { error: "Registration session expired" },
        { status: 400 },
      );
    }

    const verification = await verifyRegistrationResponse({
      response: body,
      expectedChallenge: user.currentChallenge,
      expectedOrigin: process.env.EXPECTED_ORIGIN || "http://localhost:3000",
      expectedRPID: process.env.RP_ID || "localhost",
    });

    if (verification.verified && verification.registrationInfo) {
      const { credentialPublicKey, credentialID, counter } =
        verification.registrationInfo;

      user.authenticators.push({
        credentialID: Buffer.from(credentialID),
        credentialPublicKey: Buffer.from(credentialPublicKey),
        counter,
        credentialDeviceType: verification.registrationInfo.credentialType,
        credentialBackedUp: verification.registrationInfo.credentialBackedUp,
      });

      user.currentChallenge = undefined; // Clear the used challenge
      await user.save();

      return NextResponse.json({ verified: true });
    }

    return NextResponse.json({ verified: false }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
