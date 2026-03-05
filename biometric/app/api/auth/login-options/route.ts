import { NextResponse } from "next/server";
import { generateAuthenticationOptions } from "@simplewebauthn/server";
import { User } from "@/models/user";
import dbConnect from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    await dbConnect();

    const user = await User.findOne({ email });
    if (!user || user.authenticators.length === 0) {
      return NextResponse.json(
        { error: "No passkeys registered for this user" },
        { status: 404 },
      );
    }

    const options = await generateAuthenticationOptions({
      rpID: process.env.RP_ID || "localhost",
      allowCredentials: user.authenticators.map((auth: any) => ({
        id: auth.credentialID,
        type: "public-key",
        transports: auth.transports,
      })),
      userVerification: "preferred",
    });

    user.currentChallenge = options.challenge;
    await user.save();

    return NextResponse.json(options);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
