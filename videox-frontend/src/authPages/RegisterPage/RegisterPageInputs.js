import React from "react";
import InputComp from "../../shared/components/InputComp";

const RegisterPageInputs = (props) => {
  const {
    mail,
    setMail,
    username,
    setUsername,
    password,
    setPassword,
    handleRegister,
  } = props;

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleRegister();
    }
  };
  return (
    <>
      <InputComp
        label="Username"
        value={username}
        setValue={setUsername}
        type="text"
        placeholder="Enter your username"
        onKeyPress={handleKeyPress}
      />
  
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

export default RegisterPageInputs;
