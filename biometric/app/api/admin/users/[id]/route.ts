import { NextResponse } from "next/server";
import { User, UserZodSchema } from "@/models/user";
import dbConnect from "@/lib/db";
import bcrypt from "bcrypt";
import { authorize, AuthorizedRequest } from "@/lib/auth";

export async function GET(
  req: AuthorizedRequest,
  { params }: { params: { id: string } },
) {
  const authResult = await authorize(req, "admin");
  if (authResult) {
    return authResult;
  }

  try {
    await dbConnect();

    const { id } = params;

    const user = await User.findById(id).select("-password -authenticators");

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error: unknown) {
    console.error("Error fetching user:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(
  req: AuthorizedRequest,
  { params }: { params: { id: string } },
) {
  const authResult = await authorize(req, "admin");
  if (authResult) {
    return authResult;
  }

  try {
    await dbConnect();

    const { id } = params;
    const body = await req.json();

    // Validate request body for partial update
    const validationResult = UserZodSchema.partial().safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { errors: validationResult.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const updateData = validationResult.data;

    // Hash password if it's being updated
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    const updatedUser = await User.findByIdAndUpdate(id, updateData, {
      new: true,
    }).select("-password -authenticators");

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(updatedUser);
  } catch (error: unknown) {
    console.error("Error updating user:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  req: AuthorizedRequest,
  { params }: { params: { id: string } },
) {
  const authResult = await authorize(req, "admin");
  if (authResult) {
    return authResult;
  }

  try {
    await dbConnect();

    const { id } = params;

    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error: unknown) {
    console.error("Error deleting user:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(
  req: AuthorizedRequest,
  { params }: { params: { id: string } },
) {
  const authResult = await authorize(req, "admin");
  if (authResult) {
    return authResult;
  }

  try {
    await dbConnect();

    const { id } = params;
    const { role } = await req.json();

    // Validate role
    const roleValidation = UserZodSchema.shape.role.safeParse(role);
    if (!roleValidation.success) {
      return NextResponse.json(
        { errors: roleValidation.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { role: roleValidation.data },
      { new: true },
    ).select("-password -authenticators");

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(updatedUser);
  } catch (error: unknown) {
    console.error("Error updating user role:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
