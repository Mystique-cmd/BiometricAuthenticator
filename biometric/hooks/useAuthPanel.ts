"use client";

import { useEffect, useMemo, useState } from "react";
import {
  browserSupportsWebAuthn,
  platformAuthenticatorIsAvailable,
  startAuthentication,
  startRegistration,
} from "@simplewebauthn/browser";
import type {
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialRequestOptionsJSON,
} from "@simplewebauthn/browser";
import {
  fetchUserRole,
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
  const [userRole, setUserRole] = useState<string | null>(null); // New state for user role

  useEffect(() => {
    let cancelled = false;

    async function detectWebAuthnSupport() {
      if (!browserSupportsWebAuthn()) {
        if (!cancelled) setWebauthnSupported(false);
        return;
      }

      try {
        const hasPlatformAuthenticator =
          await platformAuthenticatorIsAvailable();
        if (!cancelled) {
          setWebauthnSupported(hasPlatformAuthenticator);
        }
      } catch {
        if (!cancelled) setWebauthnSupported(false);
      }
    }

    void detectWebAuthnSupport();

    return () => {
      cancelled = true;
    };
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

      if (webauthnSupported === false) {
        setStatus({
          kind: "success",
          message:
            "Account created with password only. This device does not support biometric registration.",
        });
        setMode("login");
        return;
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

    if (webauthnSupported !== true) {
      await handlePasswordFallback();
      return;
    }

    try {
      // Always attempt WebAuthn login first if supported by the browser
      if (webauthnSupported) {
        setStatus({ kind: "busy", message: "Starting biometric login..." });
        try {
          const optionsRes = await getLoginOptions(email);
          if (!optionsRes.res.ok) {
            throw new Error(
              (optionsRes.json.error as string) ||
                "Failed to get biometric login options.",
            );
          }

          const options =
            optionsRes.json.options as PublicKeyCredentialRequestOptionsJSON;
          const credential = await startAuthentication({ optionsJSON: options }); // This is where the browser prompt occurs

          const verifyRes = await verifyLogin({ email, credential });
          if (!verifyRes.res.ok || !verifyRes.json.verified) {
            throw new Error((verifyRes.json.error as string) || "Biometric login failed");
          }
          setStatus({ kind: "success", message: "Login successful (biometric)." });

          const { role } = await fetchUserRole(); // Fetch user role after successful login
          if (role) {
            setUserRole(role);
          }
          return; // Exit after successful biometric login

        } catch (biometricError: unknown) {
          // If biometric login fails (e.g., user cancels, no authenticator found, etc.)
          console.warn("Biometric login failed, falling back to password:", biometricError);
          await handlePasswordFallback(); // Explicitly fall back to password login
          return;
        }
      }

      // If WebAuthn is not supported by the browser, or if biometric login failed above,
      // handlePasswordFallback will be called (either explicitly or implicitly).
      await handlePasswordFallback();

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
        webauthnUnsupported: !webauthnSupported,
      });
      if (!res.res.ok || !res.json.verified) {
        throw new Error((res.json.error as string) || "Login failed");
      }
      setStatus({ kind: "success", message: "Login successful (password)." });

      const { role } = await fetchUserRole(); // Fetch user role after successful login
      if (role) {
        setUserRole(role);
      }
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
    userRole, // Return userRole
  };
}

