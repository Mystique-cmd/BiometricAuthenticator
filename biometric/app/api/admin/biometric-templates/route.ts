import { NextResponse } from "next/server";
import { User } from "@/models/user";
import dbConnect from "@/lib/db";
import { authorize, AuthorizedRequest } from "@/lib/auth";

export async function GET(req: AuthorizedRequest) {
  const authResult = await authorize(req, "admin");
  if (authResult) {
    return authResult;
  }

  try {
    await dbConnect();

    const url = new URL(req.url);
    const userId = url.searchParams.get("userId");
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const matchQuery: Record<string, unknown> = {};
    if (userId) {
      matchQuery._id = userId;
    }

    const authenticators = await User.aggregate([
      {
        $match: matchQuery,
      },
      {
        $unwind: "$authenticators",
      },
      {
        $project: {
          _id: "$authenticators._id",
          credentialID: "$authenticators.credentialID",
          credentialPublicKey: "$authenticators.credentialPublicKey",
          counter: "$authenticators.counter",
          credentialDeviceType: "$authenticators.credentialDeviceType",
          credentialBackedUp: "$authenticators.credentialBackedUp",
          transports: "$authenticators.transports",
          userId: "$_id",
          userName: "$name",
          userEmail: "$email",
        },
      },
      {
        $skip: skip,
      },
      {
        $limit: limit,
      },
    ]);

    // For total count, we count all authenticators (potentially without pagination)
    const totalAuthenticatorsAggregate = await User.aggregate([
      {
        $match: matchQuery,
      },
      {
        $unwind: "$authenticators",
      },
      {
        $count: "total",
      },
    ]);

    const totalAuthenticators =
      totalAuthenticatorsAggregate.length > 0
        ? totalAuthenticatorsAggregate[0].total
        : 0;

    return NextResponse.json({
      data: authenticators,
      page,
      limit,
      totalPages: Math.ceil(totalAuthenticators / limit),
      totalAuthenticators,
    });
  } catch (error: unknown) {
    console.error("Error fetching authenticators:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
