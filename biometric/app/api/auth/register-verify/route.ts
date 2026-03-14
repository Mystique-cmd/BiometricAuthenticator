import { NextResponse } from "next/server";
import { User } from "@/models/user";
import dbConnect from "@/lib/db";
import { z } from "zod";

// Define the Zod schema for the request body
const RegisterVerifyRequestSchema = z.object({
  email: z.string().email(),
  body: z.any(), // The WebAuthn response body
  fingerprintTemplate: z.string().optional(), // Base64 encoded fingerprint template
  description: z.string().optional(),
  isBiometric: z.boolean().optional().default(false),
});

export async function POST(req: Request) {
  try {
    const requestBody = await req.json();

    // Validate the request body using the schema
    const validatedBody = RegisterVerifyRequestSchema.parse(requestBody);

    const { email, body, fingerprintTemplate, description, isBiometric } = validatedBody;

    await dbConnect();

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { error: "Unable to verify registration" },
        { status: 400 },
      );
    }

    const verification = await verifyRegistrationResponse({
      response: body,
      expectedChallenge: user.currentChallenge,
      expectedOrigin: process.env.EXPECTED_ORIGIN || "http://localhost:3000", // In production, ensure this is set to your secure (HTTPS) origin
      expectedRPID: process.env.RP_ID || "localhost",
    });

    if (verification.verified && verification.registrationInfo) {
      const { credential } = verification.registrationInfo;
      const credentialIdBytes =
        typeof credential.id === "string"
          ? isoBase64URL.toBuffer(credential.id)
          : credential.id;
      const publicKeyBytes =
        credential.publicKey instanceof Uint8Array
          ? credential.publicKey
          : new Uint8Array(credential.publicKey);

      const newAuthenticator: any = { // Use 'any' temporarily for flexibility
        credentialID: Buffer.from(credentialID),
        credentialPublicKey: Buffer.from(credentialPublicKey),
        counter,
        credentialDeviceType: verification.registrationInfo.credentialType,
        credentialBackedUp: verification.registrationInfo.credentialBackedUp,
      };

      if (fingerprintTemplate) {
        newAuthenticator.fingerprintTemplate = Buffer.from(fingerprintTemplate, 'base64');
        newAuthenticator.isBiometric = true; // Automatically set to true if template is provided
      }
      if (description) {
        newAuthenticator.description = description;
      }
      if (isBiometric !== undefined) {
        newAuthenticator.isBiometric = isBiometric;
      }


      user.authenticators.push(newAuthenticator);

      await user.save();

      return NextResponse.json({ verified: true });
    }

    return NextResponse.json({ verified: false }, { status: 400 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
        return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
