"use client";

import { useEffect, useMemo, useState } from "react";
import {
  browserSupportsWebAuthn,
  startAuthentication,
  startRegistration,
} from "@simplewebauthn/browser";
import type {
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialRequestOptionsJSON,
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
type FieldErrors = Record<string, string>;

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Request failed.";
}

export function useAuthPanel(initialMode: Mode = "signup") {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [nationalID, setNationalID] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [mode, setMode] = useState<Mode>(initialMode);
  const [attempted, setAttempted] = useState<{ signup: boolean; login: boolean }>(
    { signup: false, login: false },
  );
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

  const signupErrors = useMemo(() => {
    const errors: FieldErrors = {};
    if (name.trim().length < 3) errors.name = "Full name is required.";
    if (phoneNumber.trim().length < 10)
      errors.phoneNumber = "Phone number is required.";
    if (!email.trim()) errors.email = "Email is required.";
    if (nationalID.trim().length < 8)
      errors.nationalID = "National ID is required.";
    if (accountNumber.trim().length < 10)
      errors.accountNumber = "Account number is required.";
    if (password.trim().length < 6)
      errors.password = "Password must be at least 6 characters.";
    return errors;
  }, [name, phoneNumber, email, nationalID, accountNumber, password]);

  const loginErrors = useMemo(() => {
    const errors: FieldErrors = {};
    if (!email.trim()) errors.email = "Email is required.";
    if (webauthnSupported === false && password.trim().length < 6) {
      errors.password = "Password must be at least 6 characters.";
    }
    return errors;
  }, [email, password, webauthnSupported]);

  const currentErrors = mode === "signup" ? signupErrors : loginErrors;
  const hasErrors = Object.keys(currentErrors).length > 0;
  const showValidation = attempted[mode] && hasErrors;
  const validationSummary = showValidation ? Object.values(currentErrors) : [];

  async function handleRegister() {
    if (Object.keys(signupErrors).length > 0) {
      setAttempted((prev) => ({ ...prev, signup: true }));
      return;
    }
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
        optionsRes.json.options as PublicKeyCredentialCreationOptionsJSON;
      const credential = await startRegistration({ optionsJSON: options });

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
    if (Object.keys(loginErrors).length > 0) {
      setAttempted((prev) => ({ ...prev, login: true }));
      return;
    }

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
        optionsRes.json.options as PublicKeyCredentialRequestOptionsJSON;
      const credential = await startAuthentication({ optionsJSON: options });

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
    if (Object.keys(loginErrors).length > 0) {
      setAttempted((prev) => ({ ...prev, login: true }));
      return;
    }
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
    currentErrors,
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
    showValidation,
    validationSummary,
    webauthnSupported,
  };
}
