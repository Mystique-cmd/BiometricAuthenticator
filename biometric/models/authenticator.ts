import mongoose from "mongoose";
import { z } from "zod";

export const AuthenticatorZodSchema = z.object({
  credentialID: z.instanceof(Buffer),
  credentialPublicKey: z.instanceof(Buffer),
  counter: z.number(),
  credentialDeviceType: z.string(),
  credentialBackedUp: z.boolean(),
  transports: z.array(z.string()).optional(),
  fingerprintTemplate: z.instanceof(Buffer).optional(),
  description: z.string().optional(),
  isBiometric: z.boolean().default(false),
});

export const AuthenticatorSchema = new mongoose.Schema({
  credentialID: { type: Buffer, required: true },
  credentialPublicKey: { type: Buffer, required: true },
  counter: { type: Number, required: true },
  credentialDeviceType: { type: String, required: true },
  credentialBackedUp: { type: Boolean, required: true },
  transports: [String],
  fingerprintTemplate: { type: Buffer },
  description: { type: String },
  isBiometric: { type: Boolean, default: false },
});

export const Authenticator =
  mongoose.models.Authenticator ||
  mongoose.model("Authenticator", AuthenticatorSchema);

export type AuthenticatorType = z.infer<typeof AuthenticatorZodSchema>;
