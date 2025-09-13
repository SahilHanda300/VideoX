import React from "react";
import InputComp from "../../shared/components/InputComp";
const RegisterPageInputs = (props) => {
  const { mail, setMail, username, setUsername, password, setPassword } =
    props;
  return (
    <>
      <InputComp
        label="Username"
        value={username}
        setValue={setUsername}
        type="text"
        placeholder="Enter your username"
      />
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

export default RegisterPageInputs;
