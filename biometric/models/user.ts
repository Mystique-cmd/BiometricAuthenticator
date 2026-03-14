import mongoose from "mongoose";
import { z } from "zod";
import { AuthenticatorZodSchema, AuthenticatorSchema } from "./authenticator";

export const UserZodSchema = z.object({
  name: z
    .string()
    .min(3, "Name must be at least 3 characters")
    .max(100, "Name is too long"),
  phoneNumber: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .max(15, "Phone number is too long"),
  email: z.string().email("Invalid email address"),
  nationalID: z
    .number()
    .gte(10000000, "National ID must be at least 8 digits")
    .lte(999999999999, "National ID is too long"),
  accountNumber: z
    .string()
    .min(10, "Account number must be at least 10 digits")
    .max(20, "Account number is too long"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z
    .enum(["admin", "customer"])
    .default("customer"),
  authenticators: z.array(AuthenticatorZodSchema),
});

export const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["admin", "customer"],
      default: "customer",
    },
    nationalID: { type: Number, required: true, unique: true },
    accountNumber: { type: String, required: true, unique: true },
    authenticators: [AuthenticatorSchema],
  },

  { timestamps: true },
);

export const User = mongoose.models.User || mongoose.model("User", UserSchema);

export type UserType = z.infer<typeof UserZodSchema>;
