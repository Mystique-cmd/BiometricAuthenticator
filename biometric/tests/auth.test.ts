import { describe, expect, it, vi } from "vitest";
import { User } from "@/models/user";
import { Challenge } from "@/models/challenge";
import { setChallenge } from "@/lib/auth/challenges";

vi.mock("@/lib/auth/webauthn", () => ({
  buildRegistrationOptions: vi.fn(() => ({ challenge: "reg-challenge" })),
  buildAuthenticationOptions: vi.fn(() => ({ challenge: "login-challenge" })),
  verifyRegistration: vi.fn(async () => ({
    verified: true,
    registrationInfo: {
      credential: {
        publicKey: new Uint8Array([1, 2, 3]),
        id: new Uint8Array([4, 5, 6]),
        counter: 0,
      },
      credentialType: "public-key",
      credentialBackedUp: false,
    },
  })),
  verifyAuthentication: vi.fn(async () => ({
    verified: true,
    authenticationInfo: { newCounter: 1 },
  })),
}));

vi.mock("@/lib/auth/jwt", () => ({
  issueJwt: vi.fn(() => "test.jwt"),
}));

import { POST as registerOptions } from "@/app/api/auth/register-options/route";
import { POST as registerVerify } from "@/app/api/auth/register-verify/route";
import { POST as loginOptions } from "@/app/api/auth/login-options/route";
import { POST as loginVerify } from "@/app/api/auth/login-verify/route";
import { POST as loginPassword } from "@/app/api/auth/login-password/route";
import { POST as registerUser } from "@/app/api/auth/register-user/route";

type AuthenticatorEntry = {
  credentialID: Buffer;
  credentialPublicKey: Buffer;
  counter: number;
  credentialDeviceType: string;
  credentialBackedUp: boolean;
  transports?: string[];
};

type UserOverrides = Partial<{
  name: string;
  phoneNumber: string;
  email: string;
  nationalID: number;
  accountNumber: string;
  password: string;
  role: "admin" | "customer";
  authenticators: AuthenticatorEntry[];
}>;

async function createUser(overrides: UserOverrides = {}) {
  return User.create({
    name: "Test User",
    phoneNumber: "0700000000",
    email: "user@example.com",
    nationalID: 12345678,
    accountNumber: "1234567890",
    password: "",
    role: "customer",
    authenticators: [],
    ...overrides,
  });
}

describe("Auth flows", () => {
  it("register user creates a new user record", async () => {
    const req = new Request("http://localhost/api/auth/register-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "New User",
        phoneNumber: "0711111111",
        email: "new@example.com",
        nationalID: 87654321,
        accountNumber: "1234567890",
        password: "secret123",
      }),
    });
    const res = await registerUser(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.created).toBe(true);

    const user = await User.findOne({ email: "new@example.com" });
    expect(user).not.toBeNull();
    expect(user?.password).not.toBe("secret123");
  });

  it("register options stores challenge", async () => {
    const user = await createUser();

    const req = new Request("http://localhost/api/auth/register-options", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: user.email }),
    });
    const res = await registerOptions(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.options.challenge).toBe("reg-challenge");

    const challenge = await Challenge.findOne({
      email: user.email,
      purpose: "register",
    });
    expect(challenge).not.toBeNull();
  });

  it("register verify stores authenticator and password", async () => {
    const user = await createUser();
    await Challenge.create({
      email: user.email,
      userId: user._id,
      purpose: "register",
      challenge: "reg-challenge",
      rpId: "localhost",
      origin: "http://localhost:3000",
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 60_000),
    });

    const req = new Request("http://localhost/api/auth/register-verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: user.email,
        password: "secret123",
        credential: { id: "abc", response: {}, type: "public-key" },
      }),
    });
    const res = await registerVerify(req);
    const json = await res.json();

    const updated = await User.findById(user._id);
    expect(json.verified).toBe(true);
    expect(updated?.authenticators.length).toBe(1);
    expect(updated?.password).not.toBe("secret123");
  });

  it("login options stores challenge", async () => {
    const user = await createUser({
      authenticators: [
        {
          credentialID: Buffer.from("cred"),
          credentialPublicKey: Buffer.from("pk"),
          counter: 0,
          credentialDeviceType: "public-key",
          credentialBackedUp: false,
        },
      ],
    });

    const req = new Request("http://localhost/api/auth/login-options", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: user.email }),
    });
    const res = await loginOptions(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.options.challenge).toBe("login-challenge");

    const challenge = await Challenge.findOne({
      email: user.email,
      purpose: "login",
    });
    expect(challenge).not.toBeNull();
  });

  it("login verify updates counter and sets session cookie", async () => {
    const user = await createUser({
      authenticators: [
        {
          credentialID: Buffer.from("cred"),
          credentialPublicKey: Buffer.from("pk"),
          counter: 0,
          credentialDeviceType: "public-key",
          credentialBackedUp: false,
        },
      ],
    });
    await Challenge.create({
      email: user.email,
      userId: user._id,
      purpose: "login",
      challenge: "login-challenge",
      rpId: "localhost",
      origin: "http://localhost:3000",
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 60_000),
    });

    const credentialId = Buffer.from("cred").toString("base64url");
    const req = new Request("http://localhost/api/auth/login-verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: user.email,
        credential: { id: credentialId, response: {}, type: "public-key" },
      }),
    });
    const res = await loginVerify(req);
    const json = await res.json();

    const updated = await User.findById(user._id);
    expect(json.verified).toBe(true);
    expect(updated?.authenticators[0].counter).toBe(1);
    expect(res.headers.get("set-cookie")).toContain("session=");
  });

  it("password fallback is blocked unless webauthnUnsupported is true", async () => {
    const user = await createUser({
      password: "secret123",
      authenticators: [
        {
          credentialID: Buffer.from("cred"),
          credentialPublicKey: Buffer.from("pk"),
          counter: 0,
          credentialDeviceType: "public-key",
          credentialBackedUp: false,
        },
      ],
    });

    const blockedReq = new Request("http://localhost/api/auth/login-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: user.email,
        password: "secret123",
        webauthnUnsupported: false,
      }),
    });
    const blockedRes = await loginPassword(blockedReq);
    expect(blockedRes.status).toBe(400);

    const allowedReq = new Request("http://localhost/api/auth/login-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: user.email,
        password: "secret123",
        webauthnUnsupported: true,
      }),
    });
    const allowedRes = await loginPassword(allowedReq);
    const json = await allowedRes.json();
    expect(json.verified).toBe(true);
    expect(allowedRes.headers.get("set-cookie")).toContain("session=");
  });

  it("challenge TTL is set on creation", async () => {
    const user = await createUser();
    const start = Date.now();

    await setChallenge({
      email: user.email,
      userId: user._id.toString(),
      purpose: "login",
      challenge: "ttl-challenge",
      rpId: "localhost",
      origin: "http://localhost:3000",
      ttlMs: 1000,
    });

    const doc = await Challenge.findOne({
      email: user.email,
      purpose: "login",
    });

    expect(doc).not.toBeNull();
    expect(doc!.expiresAt.getTime()).toBeGreaterThan(start);
    expect(doc!.expiresAt.getTime() - start).toBeLessThan(5000);
  });
});
