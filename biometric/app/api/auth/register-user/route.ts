import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { User } from "@/models/user";
import { parseJson, registerUserSchema } from "@/lib/auth/validators";
import { hashPassword } from "@/lib/auth/password";
import { AuditLog } from "@/models/auditLog";

export async function POST(req: Request) {
  try {
    const body = await parseJson(req, registerUserSchema);
    await dbConnect();

    const existing = await User.findOne({
      $or: [
        { email: body.email },
        { nationalID: body.nationalID },
        { accountNumber: body.accountNumber },
      ],
    });

    if (existing) {
      return NextResponse.json(
        { error: "Unable to create user" },
        { status: 409 },
      );
    }

    const hashed = await hashPassword(body.password);

    const user = await User.create({
      name: body.name,
      phoneNumber: body.phoneNumber,
      email: body.email,
      nationalID: body.nationalID,
      accountNumber: body.accountNumber,
      password: hashed,
      role: body.role ?? "customer",
      authenticators: [],
    });

    try {
      await AuditLog.create({
        userId: user._id,
        action: "Registration Success",
        status: "Success",
        details: { method: "password" },
      });
    } catch (error: unknown) {
      console.error("Audit log failure:", error);
    }

    return NextResponse.json({ created: true });
  } catch {
    return NextResponse.json(
      { error: "Unable to create user" },
      { status: 400 },
    );
  }
}
