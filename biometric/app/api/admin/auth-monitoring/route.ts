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

    const query: any = {
      action: {
        $in: [
          "User Login",
          "Login Failure",
          "Registration Success",
          "Registration Failure",
          "Authenticator Added",
          "Authenticator Removed",
          "Password Change",
        ],
      }, // Filter for authentication-related actions
    };

    const userId = url.searchParams.get("userId");
    const status = url.searchParams.get("status");
    const action = url.searchParams.get("action");
    const fromDate = url.searchParams.get("fromDate");
    const toDate = url.searchParams.get("toDate");

    if (userId) {
      query.userId = userId;
    }
    if (status) {
      query.status = status;
    }
    if (action) {
      query.action = action; // Exact match for specific action
    }
    if (fromDate || toDate) {
      query.timestamp = {};
      if (fromDate) {
        query.timestamp.$gte = new Date(fromDate);
      }
      if (toDate) {
        query.timestamp.$lte = new Date(toDate);
      }
    }

    const sort: any = {};
    const sortBy = url.searchParams.get("sortBy") || "timestamp";
    const sortOrder = url.searchParams.get("sortOrder") === "asc" ? 1 : -1;
    sort[sortBy] = sortOrder;

    const authLogs = await AuditLog.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate("userId", "name email");

    const totalAuthLogs = await AuditLog.countDocuments(query);

    return NextResponse.json({
      data: authLogs,
      page,
      limit,
      totalPages: Math.ceil(totalAuthLogs / limit),
      totalAuthLogs,
    });
  } catch (error: any) {
    console.error("Error fetching authentication logs:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
