import React from "react";
import InputComp from "../../shared/components/InputComp";
// Renders input fields for registration form
const RegisterPageInputs = (props) => {
  // Destructure form state and setters from props
  const { mail, setMail, username, setUsername, password, setPassword } = props;
  return (
    <>
      {/* Username input */}
      <InputComp
        label="Username"
        value={username}
        setValue={setUsername}
        type="text"
        placeholder="Enter your username"
      />
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

export default RegisterPageInputs;
