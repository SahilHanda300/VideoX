import React, { useState, useEffect } from "react";
import AuthComp from "../../shared/components/AuthComp";
import { Typography } from "@mui/material";
import RegisterPageInputs from "./RegisterPageInputs";
import RegisterPageFooter from "./RegisterPageFooter";
import { validateRegisterForm } from "../../shared/utilities/validators";
import {connect} from "react-redux";
import { getActions } from "../../actions/authActions";
import { useNavigate } from "react-router-dom";
const RegisterPage = ({register}) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [mail, setMail] = useState("");
  const [password, setPassword] = useState("");

  const [isFormValid, setIsFormValid] = useState(false);

  const handleRegister = () => {
    register({username, mail, password},navigate);
  };

  useEffect(() => {
    setIsFormValid(validateRegisterForm({ mail, password, username }));
  }, [mail, password, username, setIsFormValid]);

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
        mail={mail}
        setMail={setMail}
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
const mapActionsToProps = (dispatch) => {
    return {
       ...getActions(dispatch),
    };
}

export default connect(null, mapActionsToProps)(RegisterPage);
