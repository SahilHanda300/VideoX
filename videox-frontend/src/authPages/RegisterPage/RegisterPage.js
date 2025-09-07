import React, { useState, useEffect } from "react";
import AuthComp from "../../shared/components/AuthComp";
import { Typography } from "@mui/material";
import RegisterPageInputs from "./RegisterPageInputs";
import RegisterPageFooter from "./RegisterPageFooter";
import { validateRegisterForm } from "../../shared/utilities/validators";

const RegisterPage = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [isFormValid, setIsFormValid] = useState(false);

  const handleRegister = () => {
    console.log("Email:", email);
    console.log("Username:", username);
  };

  useEffect(() => {
    setIsFormValid(validateRegisterForm({ email, password, username }));
  }, [email, password, username, setIsFormValid]);

  return (
    <AuthComp>
      <Typography
        variant="h3"
        sx={{ fontSize: { xs: "1.5rem", lg: "2rem" } }}
        gutterBottom
      >
        Create an Account
      </Typography>
      <RegisterPageInputs
        username={username}
        setUsername={setUsername}
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
      />
      <RegisterPageFooter
        isFormValid={isFormValid}
        handleRegister={handleRegister}
      />
    </AuthComp>
  );
};

export default RegisterPage;
