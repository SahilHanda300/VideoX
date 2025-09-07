import React from "react";
import InputComp from "../../shared/components/InputComp";

const LoginPageInputs = ({ email, setEmail, password, setPassword }) => {
  return (
    <>
      <InputComp
        label="Email"
        value={email}
        setValue={setEmail}
        type="email"
        placeholder="Enter your email"
      />
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
