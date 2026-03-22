import { NextResponse } from "next/server";
import { User } from "@/models/user";
import dbConnect from "@/lib/db";
import { buildAuthenticationOptions } from "@/lib/auth/webauthn";
import { parseJson, loginOptionsSchema } from "@/lib/auth/validators";
import { setChallenge } from "@/lib/auth/challenges";
import { getRpConfig } from "@/lib/auth/config";

export async function POST(req: Request) {
  try {
    const { email } = await parseJson(req, loginOptionsSchema);
    await dbConnect();

    const user = await User.findOne({ email });
    if (!user || user.authenticators.length === 0) {
      return NextResponse.json(
        { error: "Unable to initiate login" },
        { status: 404 },
      );
    }

    const options = await buildAuthenticationOptions({
      authenticators: user.authenticators ?? [],
    });

    const { rpId, expectedOrigin } = getRpConfig();
    await setChallenge({
      email: user.email,
      userId: user._id.toString(),
      purpose: "login",
      challenge: options.challenge,
      rpId,
      origin: expectedOrigin,
    });

    return NextResponse.json({ options });
  } catch (error) {
    console.error("Error in login-options API:", error);
    return NextResponse.json(
      { error: "Unable to initiate login" },
      { status: 500 },
    );
  }
}
