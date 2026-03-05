import { NextResponse } from "next/server";
import { generateRegistrationOptions } from "@simplewebauthn/server";
import { User } from "@/models/user";
import dbConnect from "@/lib/db";

export async function POST(req: Request) {
  const { email } = await req.json();
  await dbConnect();

  const user = await User.findOne({ email });
  if (!user)
    return NextResponse.json({ error: "User not found" }, { status: 404 });

  const options = await generateRegistrationOptions({
    rpName: "My App",
    rpID: process.env.RP_ID || "localhost",
    userID: user._id.toString(),
    userName: user.email,
    userDisplayName: user.name,
    attestationType: "none",
    excludeCredentials: user.authenticators.map((auth) => ({
      id: auth.credentialID,
      type: "public-key",
      transports: auth.transports,
    })),
    authenticatorSelection: {
      residentKey: "preferred",
      userVerification: "preferred",
    },
  });

  user.currentChallenge = options.challenge;
  await user.save();

  return NextResponse.json(options);
}
