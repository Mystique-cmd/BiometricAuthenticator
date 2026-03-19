import mongoose from "mongoose";
import { z } from "zod";

// Zod Schema for validation
export const AuditLogZodSchema = z.object({
  timestamp: z.date().default(() => new Date()),
  userId: z.string().optional(), // ID of the user who performed the action
  action: z.string().min(1, "Action description cannot be empty"),
  details: z.record(z.string(), z.any()).optional(), // Flexible object for additional context
  ipAddress: z.string().optional(),
  status: z.enum(["Success", "Failure", "Info"]).default("Info"),
  targetId: z.string().optional(), // ID of the resource affected
});

// Mongoose Schema
export const AuditLogSchema = new mongoose.Schema(
  {
    timestamp: { type: Date, default: Date.now },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Reference to User model
    action: { type: String, required: true },
    details: { type: mongoose.Schema.Types.Mixed }, // Mixed type for flexibility
    ipAddress: { type: String },
    status: { type: String, enum: ["Success", "Failure", "Info"], default: "Info" },
    targetId: { type: mongoose.Schema.Types.ObjectId }, // Generic ID for target
  },
  { timestamps: true }, // Adds createdAt and updatedAt automatically
);

export const AuditLog =
  mongoose.models.AuditLog || mongoose.model("AuditLog", AuditLogSchema);

export type AuditLogType = z.infer<typeof AuditLogZodSchema>;
