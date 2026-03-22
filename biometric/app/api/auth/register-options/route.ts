import { NextResponse } from "next/server";
import { User } from "@/models/user";
import dbConnect from "@/lib/db";
import { buildRegistrationOptions } from "@/lib/auth/webauthn";
import { parseJson, registerOptionsSchema } from "@/lib/auth/validators";
import { setChallenge } from "@/lib/auth/challenges";
import { getRpConfig } from "@/lib/auth/config";

export async function POST(req: Request) {
  try {
    const { email } = await parseJson(req, registerOptionsSchema);
    await dbConnect();

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { error: "Unable to initiate registration" },
        { status: 404 },
      );
    }

    const options = await buildRegistrationOptions({
      _id: user._id.toString(),
      email: user.email,
      name: user.name,
      authenticators: user.authenticators ?? [],
    });

    const { rpId, expectedOrigin } = getRpConfig();
    await setChallenge({
      email: user.email,
      userId: user._id.toString(),
      purpose: "register",
      challenge: options.challenge,
      rpId,
      origin: expectedOrigin,
    });

    return NextResponse.json({ options });
  } catch (error) {
    console.error("Error in register-options API:", error);
    return NextResponse.json(
      { error: "Unable to initiate registration" },
      { status: 400 },
    );
  }
}
