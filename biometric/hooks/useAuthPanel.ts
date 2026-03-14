"use client";

import { useEffect, useMemo, useState } from "react";
import {
  browserSupportsWebAuthn,
  startAuthentication,
  startRegistration,
} from "@simplewebauthn/browser";
import {
  getLoginOptions,
  getRegisterOptions,
  passwordLogin,
  registerUser,
  verifyLogin,
  verifyRegister,
} from "@/lib/auth/client";

export type StatusKind = "idle" | "busy" | "success" | "error";
export type Status = { kind: StatusKind; message: string };

type Mode = "signup" | "login";

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Request failed.";
}

export function useAuthPanel() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [nationalID, setNationalID] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [mode, setMode] = useState<Mode>("signup");
  const [status, setStatus] = useState<Status>({
    kind: "idle",
    message: "",
  });
  const [webauthnSupported, setWebauthnSupported] = useState<boolean | null>(
    null,
  );

  useEffect(() => {
    setWebauthnSupported(browserSupportsWebAuthn());
  }, []);

  const canSubmit = useMemo(() => {
    return email.trim().length > 0 && password.trim().length >= 6;
  }, [email, password]);

  const canSubmitSignup = useMemo(() => {
    return (
      name.trim().length >= 3 &&
      phoneNumber.trim().length >= 10 &&
      email.trim().length > 0 &&
      nationalID.trim().length >= 8 &&
      accountNumber.trim().length >= 10 &&
      password.trim().length >= 6
    );
  }, [name, phoneNumber, email, nationalID, accountNumber, password]);

  async function handleRegister() {
    if (!canSubmitSignup) return;
    if (webauthnSupported === false) {
      setStatus({
        kind: "error",
        message: "Fingerprint is required to complete signup.",
      });
      return;
    }

    setStatus({ kind: "busy", message: "Starting registration..." });

    try {
      const createRes = await registerUser({
        name,
        phoneNumber,
        email,
        nationalID: Number(nationalID),
        accountNumber,
        password,
      });
      if (!createRes.res.ok) {
        throw new Error(
          (createRes.json.error as string) || "User creation failed",
        );
      }

      const optionsRes = await getRegisterOptions(email);
      if (!optionsRes.res.ok) {
        throw new Error(
          (optionsRes.json.error as string) || "Registration failed",
        );
      }

      const options =
        optionsRes.json.options as Parameters<typeof startRegistration>[0];
      const credential = await startRegistration(options);

      const verifyRes = await verifyRegister({ email, password, credential });
      if (!verifyRes.res.ok || !verifyRes.json.verified) {
        throw new Error(
          (verifyRes.json.error as string) || "Registration failed",
        );
      }

      setStatus({ kind: "success", message: "Registration successful." });
    } catch (error: unknown) {
      setStatus({
        kind: "error",
        message: getErrorMessage(error) || "Registration failed.",
      });
    }
  }

  async function handleLogin() {
    if (!email.trim()) return;

    if (!webauthnSupported) {
      await handlePasswordFallback();
      return;
    }

    setStatus({ kind: "busy", message: "Starting fingerprint login..." });
    try {
      const optionsRes = await getLoginOptions(email);
      if (!optionsRes.res.ok) {
        throw new Error(
          (optionsRes.json.error as string) || "Login failed",
        );
      }

      const options =
        optionsRes.json.options as Parameters<typeof startAuthentication>[0];
      const credential = await startAuthentication(options);

      const verifyRes = await verifyLogin({ email, credential });
      if (!verifyRes.res.ok || !verifyRes.json.verified) {
        throw new Error((verifyRes.json.error as string) || "Login failed");
      }

      setStatus({ kind: "success", message: "Login successful." });
    } catch (error: unknown) {
      setStatus({ kind: "error", message: getErrorMessage(error) });
    }
  }

  async function handlePasswordFallback() {
    if (!canSubmit) return;
    setStatus({ kind: "busy", message: "Starting password login..." });

    try {
      const res = await passwordLogin({
        email,
        password,
        webauthnUnsupported: true,
      });
      if (!res.res.ok || !res.json.verified) {
        throw new Error((res.json.error as string) || "Login failed");
      }
      setStatus({ kind: "success", message: "Login successful." });
    } catch (error: unknown) {
      setStatus({ kind: "error", message: getErrorMessage(error) });
    }
  }

  return {
    accountNumber,
    canSubmit,
    canSubmitSignup,
    email,
    handleLogin,
    handlePasswordFallback,
    handleRegister,
    mode,
    name,
    nationalID,
    password,
    phoneNumber,
    setAccountNumber,
    setEmail,
    setMode,
    setName,
    setNationalID,
    setPassword,
    setPhoneNumber,
    status,
    webauthnSupported,
  };
}
