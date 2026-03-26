import { NextResponse } from "next/server";
import { User } from "@/models/user";
import dbConnect from "@/lib/db";
import { parseJson, passwordLoginSchema } from "@/lib/auth/validators";
import { issueJwt } from "@/lib/auth/jwt";
import { verifyPassword } from "@/lib/auth/password";
import { AuditLog } from "@/models/auditLog";

export async function POST(req: Request) {
  try {
    const { email, password, webauthnUnsupported } = await parseJson(
      req,
      passwordLoginSchema,
    );
    await dbConnect();

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { error: "Unable to verify login" },
        { status: 400 },
      );
    }

    if (!user.password) {
      return NextResponse.json(
        { error: "Unable to verify login" },
        { status: 400 },
      );
    }

    const matches = await verifyPassword(password, user.password);
    if (!matches) {
      return NextResponse.json(
        { error: "Unable to verify login" },
        { status: 400 },
      );
    }

    const token = issueJwt({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      authMethod: "password",
    });

    const response = NextResponse.json({ verified: true });
    response.cookies.set("session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    try {
      await AuditLog.create({
        userId: user._id,
        action: "User Login",
        status: "Success",
        details: { method: "password" },
      });
    } catch (error: unknown) {
      console.error("Audit log failure:", error);
    }

    return response;
  } catch (error) {
    console.error("Error in login-password API:", error);
    return NextResponse.json(
      { error: "Unable to verify login" },
      { status: 500 },
    );
  }
}
