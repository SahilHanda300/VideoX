import React from "react";
import CustomButton from "../../shared/components/CustomButton";
import RedirectInfo from "../../shared/components/RedirectInfo";
import { useNavigate } from "react-router-dom";
import { Tooltip } from "@mui/material";
// Footer for login page: handles login button and redirect to register
const LoginPageFooter = ({ handleLogin, isFormValid }) => {
  const navigate = useNavigate();

  // Redirect to register page
  const redirectHandler = () => {
    navigate("/register");
  };
  return (
    <>
      {/* Login button with tooltip for validation */}
      <Tooltip
        title={
          isFormValid
            ? "Click your way to the Dashboard"
            : "Email and Password should be 6 to 12 characters long"
        }
      >
        <div>
          <CustomButton
            label="Login"
            onClick={handleLogin}
            disabled={!isFormValid}
          />
        </div>
      </Tooltip>
      {/* Redirect to register link */}
      <RedirectInfo
        text="Don't have an account?"
        redirectText="Register"
        redirectHandler={redirectHandler}
      />
    </>
  );
};

export default LoginPageFooter;
