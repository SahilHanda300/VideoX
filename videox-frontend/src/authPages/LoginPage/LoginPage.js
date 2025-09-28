import React, { useState, useEffect } from "react";
import AuthComp from "../../shared/components/AuthComp";
import LoginPageHeader from "./LoginPageHeader";
import LoginPageInputs from "./LoginPageInputs";
import LoginPageFooter from "./LoginPageFooter";
import { validateLoginForm } from "../../shared/utilities/validators";
import { connect } from "react-redux";
import { getActions } from "../../actions/authActions";
import { useNavigate } from "react-router-dom";


const LoginPage = ({ login }) => {
  const navigate = useNavigate();
  const [mail, setMail] = useState("");
  const [password, setPassword] = useState("");
  const [isFormValid, setIsFormValid] = useState(false);

  useEffect(() => {
    setIsFormValid(validateLoginForm({ mail, password }));
  }, [mail, password]);

    const handleLogin = async () => {
    const success = await login({ mail, password }, navigate);
    // If login failed, we stay on the login page (no navigation needed)
    // The error message will be shown via the alert system
  };

  
  return (
    <AuthComp>
      <LoginPageHeader />
      <LoginPageInputs
        mail={mail}
        setMail={setMail}
        password={password}
        setPassword={setPassword}
        handleLogin={handleLogin}
      />
      <LoginPageFooter isFormValid={isFormValid} handleLogin={handleLogin} />
    </AuthComp>
  );
};

const mapActionsToProps = (dispatch) => ({
  ...getActions(dispatch),
});

export default connect(null, mapActionsToProps)(LoginPage);
