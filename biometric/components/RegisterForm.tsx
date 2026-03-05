import React from "react";

const RegisterForm = () => {
  return (
    <form>
      <div>
        <label htmlFor="name">Name:</label>
        <input type="text" id="name" name="name" required />
      </div>
      <div>
        <label htmlFor="phone">Phone Number:</label>
        <input type="tel" id="phone" name="phone" required />
      </div>
      <div>
        <label htmlFor="nationalID">National ID:</label>
        <input type="text" id="nationalID" name="nationalID" required />
      </div>
      <div>
        <label htmlFor="email">Email:</label>
        <input type="email" id="email" name="email" required />
      </div>

      <div>
        <label htmlFor="accountNumber">Account Number:</label>
        <input type="text" id="accountNumber" name="accountNumber" required />
      </div>
    </form>
  );
};

export default RegisterForm;
