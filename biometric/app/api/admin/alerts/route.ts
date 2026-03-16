import { NextResponse } from "next/server";
import { Alert, AlertZodSchema } from "@/models/alert";
import dbConnect from "@/lib/db";

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();

    // Validate request body
    const validationResult = AlertZodSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { errors: validationResult.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const newAlert = new Alert(validationResult.data);
    await newAlert.save();

    return NextResponse.json(newAlert, { status: 201 });
  } catch (error: unknown) {
    console.error("Error creating alert:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    await dbConnect();

    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const query: Record<string, unknown> = {};
    const type = url.searchParams.get("type");
    const severity = url.searchParams.get("severity");
    const resolved = url.searchParams.get("resolved");
    const userId = url.searchParams.get("userId");

    if (type) {
      query.type = type;
    }
    if (severity) {
      query.severity = severity;
    }
    if (resolved !== null) {
      query.resolved = resolved === "true";
    }
    if (userId) {
      query.userId = userId;
    }

    const sort: Record<string, 1 | -1> = {};
    const sortBy = url.searchParams.get("sortBy") || "timestamp";
    const sortOrder = url.searchParams.get("sortOrder") === "asc" ? 1 : -1;
    sort[sortBy] = sortOrder;

    const alerts = await Alert.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate("userId", "name email"); // Optionally populate user details

    const totalAlerts = await Alert.countDocuments(query);

    return NextResponse.json({
      data: alerts,
      page,
      limit,
      totalPages: Math.ceil(totalAlerts / limit),
      totalAlerts,
    });
  } catch (error: unknown) {
    console.error("Error fetching alerts:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
