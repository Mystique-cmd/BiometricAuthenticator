import mongoose from "mongoose";
import { z } from "zod";
import * as crypto from "crypto";

const ALGORITHM = "aes-256-cbc";
const IV_LENGTH = 16; // For AES-256-CBC, IV length is 16 bytes

function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;
  if (!key || key.length !== 64) { // 32 bytes = 64 hex characters
    throw new Error("ENCRYPTION_KEY must be a 64-character hex string (32 bytes) in .env.local");
  }
  return Buffer.from(key, 'hex');
}

// Encryption function
function encrypt(buffer: Buffer | undefined): Buffer | undefined {
  if (!buffer) return undefined;
  // Check if buffer already starts with the 'encrypted:' prefix to prevent double encryption
  if (buffer.length > Buffer.from('encrypted:').length && buffer.toString('utf8', 0, Buffer.from('encrypted:').length) === 'encrypted:') {
    return buffer;
  }

  try {
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
    // Prepend IV to the encrypted data, and add a magic string to identify encrypted buffers
    return Buffer.concat([Buffer.from('encrypted:'), iv, encrypted]);
  } catch (error) {
    console.error("Encryption failed:", error);
    throw error;
  }
}

// Decryption function
function decrypt(buffer: Buffer | undefined): Buffer | undefined {
  if (!buffer) return undefined;
  // Check if buffer starts with the 'encrypted:' prefix, otherwise assume it's unencrypted
  if (!(buffer.length > Buffer.from('encrypted:').length && buffer.toString('utf8', 0, Buffer.from('encrypted:').length) === 'encrypted:')) {
    return buffer;
  }

  try {
    const key = getEncryptionKey();
    const iv = buffer.subarray(Buffer.from('encrypted:').length, Buffer.from('encrypted:').length + IV_LENGTH);
    const encryptedText = buffer.subarray(Buffer.from('encrypted:').length + IV_LENGTH);
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    const decrypted = Buffer.concat([decipher.update(encryptedText), decipher.final()]);
    return decrypted;
  } catch (error) {
    console.error("Decryption failed:", error);
    throw error;
  }
}

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
  fingerprintTemplate: { 
    type: Buffer, 
    set: encrypt, 
    get: decrypt 
  },
  description: { type: String },
  isBiometric: { type: Boolean, default: false },
});

export const Authenticator =
  mongoose.models.Authenticator ||
  mongoose.model("Authenticator", AuthenticatorSchema);

export type AuthenticatorType = z.infer<typeof AuthenticatorZodSchema>;