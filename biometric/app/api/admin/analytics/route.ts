import { NextResponse } from "next/server";
import { User } from "@/models/user";
import { Alert } from "@/models/alert";
import { AuditLog } from "@/models/auditLog";
import dbConnect from "@/lib/db";
import { authorize, AuthorizedRequest } from "@/lib/auth";

export async function GET(req: AuthorizedRequest) {
  const authResult = await authorize(req, "admin");
  if (authResult) {
    return authResult;
  }

  try {
    await dbConnect();

    // Total Users
    const totalUsers = await User.countDocuments();

    // Total Authenticators (sum authenticators across all users)
    const usersWithAuthenticators = await User.find().select("authenticators");
    const totalAuthenticators = usersWithAuthenticators.reduce(
      (acc, user) => acc + user.authenticators.length,
      0,
    );

    // Alerts Summary
    const totalAlerts = await Alert.countDocuments();
    const errorAlerts = await Alert.countDocuments({ type: "error" });
    const warningAlerts = await Alert.countDocuments({ type: "warning" });
    const infoAlerts = await Alert.countDocuments({ type: "info" });
    const successAlerts = await Alert.countDocuments({ type: "success" });
    const resolvedAlerts = await Alert.countDocuments({ resolved: true });

    // Recent Login Attempts (from AuditLog) - last 24 hours
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentLoginAttempts = await AuditLog.countDocuments({
      action: "User Login",
      timestamp: { $gte: twentyFourHoursAgo },
    });

    return NextResponse.json({
      totalUsers,
      totalAuthenticators,
      alerts: {
        total: totalAlerts,
        error: errorAlerts,
        warning: warningAlerts,
        info: infoAlerts,
        success: successAlerts,
        resolved: resolvedAlerts,
      },
      recentLoginAttempts,
    });
  } catch (error: unknown) {
    console.error("Error fetching analytics data:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
