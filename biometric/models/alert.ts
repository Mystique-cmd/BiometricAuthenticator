import mongoose from "mongoose";
import { z } from "zod";

// Zod Schema for validation
export const AlertZodSchema = z.object({
  message: z.string().min(1, "Alert message cannot be empty"),
  type: z.enum(["error", "warning", "info", "success"]).default("info"),
  severity: z.enum(["low", "medium", "high", "critical"]).default("medium"),
  timestamp: z.date().default(() => new Date()),
  resolved: z.boolean().default(false),
  resolvedBy: z.string().optional(), // User ID
  details: z.record(z.string(), z.any()).optional(), // Flexible object for additional context
  userId: z.string().optional(), // User ID associated with the alert
});

// Mongoose Schema
export const AlertSchema = new mongoose.Schema(
  {
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ["error", "warning", "info", "success"],
      default: "info",
    },
    severity: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },
    timestamp: { type: Date, default: Date.now },
    resolved: { type: Boolean, default: false },
    resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    details: { type: mongoose.Schema.Types.Mixed },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }, // Adds createdAt and updatedAt automatically
);

export const Alert =
  mongoose.models.Alert || mongoose.model("Alert", AlertSchema);

export type AlertType = z.infer<typeof AlertZodSchema>;
