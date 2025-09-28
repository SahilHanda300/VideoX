import React from "react";
import InputComp from "../../shared/components/InputComp";

const LoginPageInputs = ({
  mail,
  setMail,
  password,
  setPassword,
  handleLogin,
}) => {
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };
  return (
    <>
      <InputComp
        label="Mail"
        value={mail}
        setValue={setMail}
        type="email"
        placeholder="Enter your mail"
        onKeyPress={handleKeyPress}
      />

      <InputComp
        label="Password"
        value={password}
        setValue={setPassword}
        type="password"
        placeholder="Enter your password"
        onKeyPress={handleKeyPress}
      />
    </>
  );
};

export default LoginPageInputs;
