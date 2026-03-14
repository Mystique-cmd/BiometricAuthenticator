import mongoose from "mongoose";

export type ChallengePurpose = "register" | "login";

export const ChallengeSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, index: true },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    purpose: { type: String, enum: ["register", "login"], required: true },
    challenge: { type: String, required: true },
    rpId: { type: String, required: true },
    origin: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true },
);

ChallengeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
ChallengeSchema.index({ email: 1, purpose: 1 }, { unique: true });

export const Challenge =
  mongoose.models.Challenge || mongoose.model("Challenge", ChallengeSchema);
