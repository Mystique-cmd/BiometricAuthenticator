import { NextResponse } from "next/server";
import { Alert, AlertZodSchema } from "@/models/alert";
import dbConnect from "@/lib/db";
import { authorize, AuthorizedRequest } from "@/lib/auth";

export async function GET(
  req: AuthorizedRequest,
  context: { params: Promise<{ id: string }> },
) {
  const authResult = await authorize(req, "admin");
  if (authResult) {
    return authResult;
  }

  try {
    await dbConnect();

    const { id } = await context.params;

    const alert = await Alert.findById(id).populate("userId", "name email"); // Optionally populate user details

    if (!alert) {
      return NextResponse.json({ error: "Alert not found" }, { status: 404 });
    }

    return NextResponse.json(alert);
  } catch (error: unknown) {
    console.error("Error fetching alert:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(
  req: AuthorizedRequest,
  context: { params: Promise<{ id: string }> },
) {
  const authResult = await authorize(req, "admin");
  if (authResult) {
    return authResult;
  }

  try {
    await dbConnect();

    const { id } = await context.params;
    const body = await req.json();

    // Validate request body for partial update
    const validationResult = AlertZodSchema.partial().safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { errors: validationResult.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const updatedAlert = await Alert.findByIdAndUpdate(
      id,
      validationResult.data,
      {
        new: true,
      },
    ).populate("userId", "name email");

    if (!updatedAlert) {
      return NextResponse.json({ error: "Alert not found" }, { status: 404 });
    }

    return NextResponse.json(updatedAlert);
  } catch (error: unknown) {
    console.error("Error updating alert:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  req: AuthorizedRequest,
  context: { params: Promise<{ id: string }> },
) {
  const authResult = await authorize(req, "admin");
  if (authResult) {
    return authResult;
  }

  try {
    await dbConnect();

    const { id } = await context.params;

    const deletedAlert = await Alert.findByIdAndDelete(id);

    if (!deletedAlert) {
      return NextResponse.json({ error: "Alert not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Alert deleted successfully" });
  } catch (error: unknown) {
    console.error("Error deleting alert:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
