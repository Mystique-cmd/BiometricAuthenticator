import { NextResponse } from "next/server";
import { User } from "@/models/user";
import dbConnect from "@/lib/db";
import mongoose from "mongoose";

export async function DELETE(
  req: Request,
  { params }: { params: { userId: string; authenticatorId: string } },
) {
  try {
    await dbConnect();

    const { userId, authenticatorId } = params;

    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(authenticatorId)
    ) {
      return NextResponse.json(
        { error: "Invalid User ID or Authenticator ID" },
        { status: 400 },
      );
    }

    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const authenticatorIndex = user.authenticators.findIndex(
      (auth: any) => auth._id.toString() === authenticatorId,
    );

    if (authenticatorIndex === -1) {
      return NextResponse.json(
        { error: "Authenticator not found for this user" },
        { status: 404 },
      );
    }

    user.authenticators.splice(authenticatorIndex, 1);
    await user.save();

    return NextResponse.json({
      message: "Authenticator deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting authenticator:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
