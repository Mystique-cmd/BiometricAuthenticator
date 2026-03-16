import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { UserType, User } from "@/models/user";
import dbConnect from "./db";

// Define an interface for the decoded JWT payload
interface JwtPayload {
  userId?: string;
  sub?: string;
  iat: number;
  exp: number;
}

// Extend NextRequest to include user and role properties
export interface AuthorizedRequest extends NextRequest {
  user?: {
    _id: string;
    role: UserType["role"];
  };
}

export async function authorize(
  req: AuthorizedRequest,
  requiredRole?: UserType["role"], // Optional: 'admin' or 'customer'
): Promise<NextResponse | undefined> {
  const authHeader = req.headers.get("authorization");
  const bearerToken = authHeader?.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : undefined;
  const cookieToken = req.cookies.get("session")?.value;
  const token = bearerToken ?? cookieToken;

  if (!token) {
    return NextResponse.json({ error: "No token provided" }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    const userId = decoded.sub ?? decoded.userId;
    if (!userId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    await dbConnect();
    const user = await User.findById(userId).select("role");

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 401 });
    }

    // Attach user information to the request for further use in the API route
    req.user = {
      _id: userId,
      role: user.role,
    };

    // Check for required role if provided
    if (requiredRole && user.role !== requiredRole) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return undefined; // No error, authorization successful
  } catch (error: unknown) {
    console.error("Authorization error:", error);
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
