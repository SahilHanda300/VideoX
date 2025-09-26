import React, { useState, useEffect } from "react";
import AuthComp from "../../shared/components/AuthComp";
import LoginPageHeader from "./LoginPageHeader";
import LoginPageInputs from "./LoginPageInputs";
import LoginPageFooter from "./LoginPageFooter";
import { validateLoginForm } from "../../shared/utilities/validators";
import { connect } from "react-redux";
import { getActions } from "../../actions/authActions";
import { useNavigate } from "react-router-dom";

// Login page component for user authentication
const LoginPage = ({ login }) => {
  const navigate = useNavigate(); // navigation hook
  // State for form fields and validation
  const [mail, setMail] = useState("");
  const [password, setPassword] = useState("");
  const [isFormValid, setIsFormValid] = useState(false);

  // Validate form whenever mail or password changes
  useEffect(() => {
    setIsFormValid(validateLoginForm({ mail, password }));
  }, [mail, password]);

  // Handle login button click
  const handleLogin = async () => {
    await login({ mail, password }, navigate);
  };

  // Render login form
  return (
    <AuthComp>
      <LoginPageHeader />
      <LoginPageInputs
        mail={mail}
        setMail={setMail}
        password={password}
        setPassword={setPassword}
      />
      <LoginPageFooter isFormValid={isFormValid} handleLogin={handleLogin} />
    </AuthComp>
  );
};

const mapActionsToProps = (dispatch) => ({
  ...getActions(dispatch),
});

export default connect(null, mapActionsToProps)(LoginPage);
