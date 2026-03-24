import React from "react";
import { useAuthPanel } from "@/hooks/useAuthPanel";
import StatusBanner from "./auth/StatusBanner";
import ValidationSummary from "./auth/ValidationSummary"; // Import ValidationSummary

const RegisterForm = () => {
  const {
    name,
    setName,
    phoneNumber,
    setPhoneNumber,
    nationalID,
    setNationalID,
    email,
    setEmail,
    accountNumber,
    setAccountNumber,
    password,
    setPassword,
    handleRegister,
    validationSummary,
    status,
  } = useAuthPanel("signup");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleRegister();
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="name">Name:</label>
        <input
          type="text"
          id="name"
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="phone">Phone Number:</label>
        <input
          type="tel"
          id="phone"
          name="phone"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="nationalID">National ID:</label>
        <input
          type="text"
          id="nationalID"
          name="nationalID"
          value={nationalID}
          onChange={(e) => setNationalID(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="email">Email:</label>
        <input
          type="email"
          id="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div>
        <label htmlFor="accountNumber">Account Number:</label>
        <input
          type="text"
          id="accountNumber"
          name="accountNumber"
          value={accountNumber}
          onChange={(e) => setAccountNumber(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="password">Password:</label>
        <input
          type="password"
          id="password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <button type="submit" disabled={status.kind === "busy"}>
        Register
      </button>
      <ValidationSummary messages={validationSummary} /> {/* Use ValidationSummary for messages */}
      <StatusBanner status={status} /> {/* Use StatusBanner for status */}
    </form>
  );
};

export default RegisterForm;
