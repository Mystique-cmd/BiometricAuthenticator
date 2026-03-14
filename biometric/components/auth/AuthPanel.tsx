"use client";

import Field from "./Field";
import ModeToggle from "./ModeToggle";
import StatusBanner from "./StatusBanner";
import { useAuthPanel } from "@/hooks/useAuthPanel";

export default function AuthPanel() {
  const {
    accountNumber,
    canSubmitSignup,
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
    webauthnSupported,
  } = useAuthPanel();

  return (
    <div className="w-full max-w-md space-y-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">
          Biometric Authenticator
        </h1>
        <p className="text-sm text-zinc-600">
          Register with password + fingerprint, then login with fingerprint.
        </p>
      </div>

      <ModeToggle
        mode={mode}
        onChange={setMode}
        disabled={status.kind === "busy"}
      />

      {mode === "signup" && (
        <>
          <Field
            label="Full Name"
            value={name}
            onChange={setName}
            placeholder="Jane Doe"
          />
          <Field
            label="Phone Number"
            type="tel"
            value={phoneNumber}
            onChange={setPhoneNumber}
            placeholder="0700000000"
          />
          <Field
            label="National ID"
            type="number"
            value={nationalID}
            onChange={setNationalID}
            placeholder="12345678"
          />
          <Field
            label="Account Number"
            value={accountNumber}
            onChange={setAccountNumber}
            placeholder="1234567890"
          />
        </>
      )}

      <Field
        label="Email"
        type="email"
        value={email}
        onChange={setEmail}
        placeholder="you@example.com"
      />
      <Field
        label="Password"
        type="password"
        value={password}
        onChange={setPassword}
        placeholder="At least 6 characters"
      />

      <div className="flex gap-3">
        {mode === "signup" ? (
          <button
            className="flex-1 rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
            onClick={handleRegister}
            disabled={!canSubmitSignup || status.kind === "busy"}
          >
            Create Account
          </button>
        ) : (
          <button
            className="flex-1 rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
            onClick={handleLogin}
            disabled={!email.trim() || status.kind === "busy"}
          >
            Log In
          </button>
        )}
      </div>

      {webauthnSupported === false && mode === "login" && (
        <p className="text-xs text-zinc-600">
          Fingerprint not supported on this device. Password fallback enabled.
        </p>
      )}

      {webauthnSupported === false && mode === "signup" && (
        <p className="text-xs text-zinc-600">
          Fingerprint is required to complete signup.
        </p>
      )}

      <StatusBanner status={status} />
    </div>
  );
}
