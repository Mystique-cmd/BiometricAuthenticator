import { NextResponse } from "next/server";
import { AuditLog } from "@/models/auditLog";
import dbConnect from "@/lib/db";

export async function GET(req: Request) {
  try {
    await dbConnect();

    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const query: Record<string, unknown> = {};
    const userId = url.searchParams.get("userId");
    const action = url.searchParams.get("action");
    const status = url.searchParams.get("status");

    if (userId) {
      query.userId = userId;
    }
    if (action) {
      query.action = { $regex: action, $options: "i" }; // Case-insensitive partial match
    }
    if (status) {
      query.status = status;
    }

    const sort: Record<string, 1 | -1> = {};
    const sortBy = url.searchParams.get("sortBy") || "timestamp";
    const sortOrder = url.searchParams.get("sortOrder") === "asc" ? 1 : -1;
    sort[sortBy] = sortOrder;

    const auditLogs = await AuditLog.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate("userId", "name email"); // Populate user details

    const totalLogs = await AuditLog.countDocuments(query);

    return NextResponse.json({
      data: auditLogs,
      page,
      limit,
      totalPages: Math.ceil(totalLogs / limit),
      totalLogs,
    });
  } catch (error: unknown) {
    console.error("Error fetching audit logs:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
