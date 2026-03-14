import bcrypt from "bcryptjs";

const BCRYPT_PREFIX = "$2";

export function isBcryptHash(value: string) {
  return value.startsWith(BCRYPT_PREFIX);
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, stored: string) {
  if (isBcryptHash(stored)) {
    return bcrypt.compare(password, stored);
  }
  return password === stored;
}
