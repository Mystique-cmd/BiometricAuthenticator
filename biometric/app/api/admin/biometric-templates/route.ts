import { NextResponse } from "next/server";
import { User } from "@/models/user";
import dbConnect from "@/lib/db";

export async function GET(req: Request) {
  try {
    await dbConnect();

    const url = new URL(req.url);
    const userId = url.searchParams.get("userId");
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    let matchQuery: any = {};
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
  } catch (error: any) {
    console.error("Error fetching authenticators:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
