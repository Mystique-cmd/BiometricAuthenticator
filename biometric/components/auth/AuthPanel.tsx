"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation"; // Import useRouter

import Field from "./Field";
import ModeToggle from "./ModeToggle";
import StatusBanner from "./StatusBanner";
import ValidationSummary from "./ValidationSummary";
import { useAuthPanel } from "@/hooks/useAuthPanel";

export default function AuthPanel({
  initialMode = "signup",
  className,
}: {
  initialMode?: "signup" | "login";
  className?: string;
}) {
  const router = useRouter(); // Initialize useRouter
  const {
    accountNumber,
    currentErrors,
    email,
    handleLogin,
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
  } = useAuthPanel(initialMode);

  useEffect(() => {
    if (status.kind === "success" && mode === "login") {
      router.push("/dashboard"); // Redirect to dashboard on successful login
    }
  }, [status.kind, mode, router]);

  return (
    <div
      className={`w-full max-w-md space-y-6 rounded-2xl border border-zinc-800 bg-zinc-900/70 p-6 text-zinc-100 shadow-[0_25px_60px_-45px_rgba(0,0,0,0.7)] ${className ?? ""}`}
    >
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300/80">
          Identity Assurance
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-white">
          Biometric Authenticator
        </h1>
        <p className="mt-2 text-sm text-zinc-300">
          Device-bound credentials, encrypted templates, and secure session
          issuance.
        </p>
      </div>

      <ModeToggle
        mode={mode}
        onChange={setMode}
        disabled={status.kind === "busy"}
      />

      {mode === "signup" && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field
              label="Full Name"
              value={name}
              onChange={setName}
              placeholder="Jane Doe"
              error={showValidation ? currentErrors.name : undefined}
            />
          </div>
          <Field
            label="Phone Number"
            type="tel"
            value={phoneNumber}
            onChange={setPhoneNumber}
            placeholder="0700000000"
            error={showValidation ? currentErrors.phoneNumber : undefined}
          />
          <Field
            label="National ID"
            type="number"
            value={nationalID}
            onChange={setNationalID}
            placeholder="12345678"
            error={showValidation ? currentErrors.nationalID : undefined}
          />
          <div className="sm:col-span-2">
            <Field
              label="Account Number"
              value={accountNumber}
              onChange={setAccountNumber}
              placeholder="1234567890"
              error={showValidation ? currentErrors.accountNumber : undefined}
            />
          </div>
        </div>
      )}

      <Field
        label="Email"
        type="email"
        value={email}
        onChange={setEmail}
        placeholder="you@example.com"
        error={showValidation ? currentErrors.email : undefined}
      />
      <Field
        label="Password"
        type="password"
        value={password}
        onChange={setPassword}
        placeholder="At least 6 characters"
        error={showValidation ? currentErrors.password : undefined}
      />

      <div className="flex gap-3">
        {mode === "signup" ? (
          <button
            className="flex-1 rounded-md bg-cyan-400 px-3 py-2 text-sm font-semibold text-zinc-900 disabled:opacity-50"
            onClick={handleRegister}
            disabled={status.kind === "busy"}
          >
            Create Account
          </button>
        ) : (
          <button
            className="flex-1 rounded-md bg-cyan-400 px-3 py-2 text-sm font-semibold text-zinc-900 disabled:opacity-50"
            onClick={handleLogin}
            disabled={status.kind === "busy"}
          >
            Log In
          </button>
        )}
      </div>

      <ValidationSummary messages={validationSummary} />

      {webauthnSupported === false && mode === "login" && (
        <p className="text-xs text-zinc-400">
          Fingerprint not supported on this device. Password fallback enabled.
        </p>
      )}

      {webauthnSupported === false && mode === "signup" && (
        <p className="text-xs text-zinc-400">
          This device has no biometric authenticator available. Password-only
          signup will be used instead.
        </p>
      )}

      <StatusBanner status={status} />
    </div>
  );
}

