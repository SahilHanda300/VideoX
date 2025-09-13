import React from "react";
import InputComp from "../../shared/components/InputComp";

const LoginPageInputs = ({ mail, setMail, password, setPassword }) => {
  return (
    <>
      <InputComp
        label="Mail"
        value={mail}
        setValue={setMail}
        type="email"
        placeholder="Enter your mail"
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
