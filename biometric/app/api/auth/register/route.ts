import { NextResponse } from "next/server";
import { User, UserZodSchema } from "@/models/user";
import dbConnect from "@/lib/db";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();

    // Validate request body
    const validationResult = UserZodSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { errors: validationResult.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const { name, email, password, phoneNumber, nationalID, accountNumber } =
      validationResult.data;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 },
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      phoneNumber,
      nationalID,
      accountNumber,
      authenticators: [],
      role: "customer", // Default role
    });

    await newUser.save();

    // Return a success response (excluding sensitive data)
    const userResponse = {
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      phoneNumber: newUser.phoneNumber,
      nationalID: newUser.nationalID,
      accountNumber: newUser.accountNumber,
      role: newUser.role,
    };

    return NextResponse.json(
      { message: "User registered successfully", user: userResponse },
      { status: 201 },
    );
  } catch (error: unknown) {
    console.error("Registration error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
