import { z } from "zod";

const emailSchema = z.string().email();
const passwordSchema = z.string().min(6);
const nameSchema = z.string().min(3).max(100);
const phoneSchema = z.string().min(10).max(15);
const nationalIdSchema = z.number().int().min(10000000).max(999999999999);
const accountNumberSchema = z.string().min(10).max(20);

const credentialSchema = z.object({
  id: z.string(),
  response: z.record(z.string(), z.unknown()),
  type: z.string(),
});

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
  password: passwordSchema,
  credential: credentialSchema,
});

export const loginOptionsSchema = z.object({
  email: emailSchema,
});

export const loginVerifySchema = z.object({
  email: emailSchema,
  credential: credentialSchema,
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
