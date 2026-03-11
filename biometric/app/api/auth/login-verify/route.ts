import { NextResponse } from "next/server";
import { verifyAuthenticationResponse } from "@simplewebauthn/server";
import { User } from "@/models/user";
import dbConnect from "@/lib/db";
import jwt from "jsonwebtoken";
import { z } from "zod";

import { NextResponse } from "next/server";
import { verifyAuthenticationResponse } from "@simplewebauthn/server";
import { User } from "@/models/user";
import dbConnect from "@/lib/db";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { AuthenticatorType } from "@/models/authenticator"; // Import AuthenticatorType for type checking

// Define the Zod schema for the request body
const LoginVerifyRequestSchema = z.object({
  email: z.string().email(),
  body: z.any(), // The WebAuthn response body (credential from startAuthentication())
  fingerprintTemplate: z.string().optional(), // Base64 encoded fingerprint template
});

export async function POST(req: Request) {
  try {
    const requestBody = await req.json();

    // Validate the request body using the schema
    const validatedBody = LoginVerifyRequestSchema.parse(requestBody);

    const { email, body, fingerprintTemplate } = validatedBody;

    await dbConnect();

    const user = await User.findOne({ email });
    if (!user || !user.currentChallenge) {
      return NextResponse.json(
        { error: "Login session expired" },
        { status: 400 },
      );
    }

    const authenticator = user.authenticators.find(
      (auth: AuthenticatorType) => auth.credentialID.toString("base64url") === body.id,
    );

    if (!authenticator) {
      return NextResponse.json(
        { error: "Authenticator not recognized" },
        { status: 400 },
      );
    }

    let verification;
    try {
      verification = await verifyAuthenticationResponse({
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
    } catch (error: any) {
      console.error("WebAuthn verification failed:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }


    if (verification.verified) {
      // If a fingerprint template was provided, perform matching
      if (fingerprintTemplate) {
        if (!authenticator.isBiometric || !authenticator.fingerprintTemplate) {
          return NextResponse.json(
            { error: "Provided authenticator is not configured for fingerprint matching" },
            { status: 400 },
          );
        }

        const submittedFingerprintBuffer = Buffer.from(fingerprintTemplate, 'base64');
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
      user.currentChallenge = undefined;
      await user.save();

      // SUCCESS: Generate JWT
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!, {
        expiresIn: "1h",
      });

      return NextResponse.json({ verified: true, token });
    }

    return NextResponse.json({ verified: false }, { status: 400 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
        return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
