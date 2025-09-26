import React from "react";
import InputComp from "../../shared/components/InputComp";
// Renders input fields for login form
const LoginPageInputs = ({ mail, setMail, password, setPassword }) => {
  return (
    <>
      {/* Email input */}
      <InputComp
        label="Mail"
        value={mail}
        setValue={setMail}
        type="email"
        placeholder="Enter your mail"
      />
      {/* Password input */}
      <InputComp
        label="Password"
        value={password}
        setValue={setPassword}
        type="password"
        placeholder="Enter your password"
      />
    </>
  );
};

export default LoginPageInputs;
