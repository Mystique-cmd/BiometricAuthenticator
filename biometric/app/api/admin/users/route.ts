import { NextResponse } from "next/server";
import { User } from "@/models/user";
import dbConnect from "@/lib/db";
import { authorize, AuthorizedRequest } from "@/lib/auth"; // Import the helper

export async function GET(req: AuthorizedRequest) { // Change req type to AuthorizedRequest
  // Authorize request for admin role
  const authResult = await authorize(req, "admin");
  if (authResult) {
    return authResult; // Return error response if not authorized
  }

  try {
    await dbConnect();

    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const query: any = {};
    const role = url.searchParams.get("role");
    const email = url.searchParams.get("email");
    const name = url.searchParams.get("name");

    if (role) {
      query.role = role;
    }
    if (email) {
      query.email = { $regex: email, $options: "i" }; // Case-insensitive partial match
    }
    if (name) {
      query.name = { $regex: name, $options: "i" }; // Case-insensitive partial match
    }

    const sort: any = {};
    const sortBy = url.searchParams.get("sortBy") || "createdAt";
    const sortOrder = url.searchParams.get("sortOrder") === "asc" ? 1 : -1;
    sort[sortBy] = sortOrder;

    const users = await User.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .select("-password -currentChallenge -authenticators"); // Exclude sensitive fields

    const totalUsers = await User.countDocuments(query);

    return NextResponse.json({
      data: users,
      page,
      limit,
      totalPages: Math.ceil(totalUsers / limit),
      totalUsers,
    });
  } catch (error: any) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
