type JsonRecord = Record<string, unknown>;

async function parseJson(res: Response): Promise<JsonRecord> {
  const json = (await res.json().catch(() => ({}))) as JsonRecord;
  return json;
}

export async function registerUser(payload: {
  name: string;
  phoneNumber: string;
  email: string;
  nationalID: number;
  accountNumber: string;
  password: string;
}) {
  const res = await fetch("/api/auth/register-user", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const json = await parseJson(res);
  return { res, json };
}

export async function getRegisterOptions(email: string) {
  const res = await fetch("/api/auth/register-options", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  const json = await parseJson(res);
  return { res, json };
}

export async function verifyRegister(payload: {
  email: string;
  password: string;
  credential: unknown;
  fingerprintTemplate?: string;
  description?: string;
  isBiometric?: boolean;
}) {
  const res = await fetch("/api/auth/register-verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const json = await parseJson(res);
  return { res, json };
}

export async function getLoginOptions(email: string) {
  const res = await fetch("/api/auth/login-options", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  const json = await parseJson(res);
  return { res, json };
}

export async function verifyLogin(payload: {
  email: string;
  credential: unknown;
  fingerprintTemplate?: string;
}) {
  const res = await fetch("/api/auth/login-verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const json = await parseJson(res);
  return { res, json };
}

export async function passwordLogin(payload: {
  email: string;
  password: string;
  webauthnUnsupported: boolean;
}) {
  const res = await fetch("/api/auth/login-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const json = await parseJson(res);
  return { res, json };
}
