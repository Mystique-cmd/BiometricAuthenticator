import { Challenge, ChallengePurpose } from "@/models/challenge";
import dbConnect from "@/lib/db";

const DEFAULT_TTL_MS = 5 * 60 * 1000;

type SetChallengeInput = {
  email: string;
  userId: string;
  purpose: ChallengePurpose;
  challenge: string;
  rpId: string;
  origin: string;
  ttlMs?: number;
};

export async function setChallenge(input: SetChallengeInput) {
  await dbConnect();
  const expiresAt = new Date(Date.now() + (input.ttlMs ?? DEFAULT_TTL_MS));

  await Challenge.findOneAndUpdate(
    { email: input.email, purpose: input.purpose },
    {
      email: input.email,
      userId: input.userId,
      purpose: input.purpose,
      challenge: input.challenge,
      rpId: input.rpId,
      origin: input.origin,
      createdAt: new Date(),
      expiresAt,
    },
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true },
  );
}

export async function consumeChallenge(email: string, purpose: ChallengePurpose) {
  await dbConnect();
  const doc = await Challenge.findOneAndDelete({ email, purpose });
  return doc;
}
