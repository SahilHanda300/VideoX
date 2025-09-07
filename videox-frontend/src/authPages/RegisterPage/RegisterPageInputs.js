import React from "react";
import InputComp from "../../shared/components/InputComp";
const RegisterPageInputs = (props) => {
  const { email, setEmail, username, setUsername, password, setPassword } =
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

export default RegisterPageInputs;
