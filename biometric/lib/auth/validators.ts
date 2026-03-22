import { z } from "zod";

const emailSchema = z.string().email();
const passwordSchema = z.string().min(6);
const nameSchema = z.string().min(3).max(100);
const phoneSchema = z.string().min(10).max(15);
const nationalIdSchema = z.number().int().min(10000000).max(999999999999);
const accountNumberSchema = z.string().min(10).max(20);

const registrationResponseSchema = z
  .object({
    clientDataJSON: z.string(),
    attestationObject: z.string(),
    authenticatorData: z.string().optional(),
    transports: z.array(z.string()).optional(),
    publicKeyAlgorithm: z.number().optional(),
    publicKey: z.string().optional(),
  })
  .passthrough();

const authenticationResponseSchema = z
  .object({
    clientDataJSON: z.string(),
    authenticatorData: z.string(),
    signature: z.string(),
    userHandle: z.string().optional(),
  })
  .passthrough();

const registrationCredentialSchema = z
  .object({
    id: z.string(),
    rawId: z.string(),
    response: registrationResponseSchema,
    type: z.literal("public-key"),
    clientExtensionResults: z.record(z.string(), z.unknown()),
    authenticatorAttachment: z.string().nullable().optional(),
  })
  .passthrough();

const authenticationCredentialSchema = z
  .object({
    id: z.string(),
    rawId: z.string(),
    response: authenticationResponseSchema,
    type: z.literal("public-key"),
    clientExtensionResults: z.record(z.string(), z.unknown()),
    authenticatorAttachment: z.string().nullable().optional(),
  })
  .passthrough();

export const registerUserSchema = z.object({
  name: nameSchema,
  phoneNumber: phoneSchema,
  email: emailSchema,
  nationalID: nationalIdSchema,
  accountNumber: accountNumberSchema,
  password: passwordSchema,
  role: z.enum(["admin", "customer"]).optional(),
});

export const registerOptionsSchema = z.object({
  email: emailSchema,
});

export const registerVerifySchema = z.object({
  email: emailSchema,
  password: passwordSchema.optional(),
  credential: registrationCredentialSchema,
  fingerprintTemplate: z.string().optional(),
  description: z.string().optional(),
  isBiometric: z.boolean().optional(),
});

export const loginOptionsSchema = z.object({
  email: emailSchema,
});

export const loginVerifySchema = z.object({
  email: emailSchema,
  credential: authenticationCredentialSchema,
  fingerprintTemplate: z.string().optional(),
});

export const passwordLoginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  webauthnUnsupported: z.boolean().optional(),
});

export async function parseJson<T>(
  req: Request,
  schema: z.ZodType<T>,
): Promise<T> {
  const body = await req.json().catch(() => null);
  const result = schema.safeParse(body);
  if (!result.success) {
    throw new Error("Invalid request");
  }
  return result.data;
}
