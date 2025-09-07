import React from "react";
import CustomButton from "../../shared/components/CustomButton";
import RedirectInfo from "../../shared/components/RedirectInfo";
import { useNavigate } from "react-router-dom";
import { Tooltip } from "@mui/material";
const LoginPageFooter = ({ handleLogin, isFormValid }) => {
  const navigate = useNavigate();
  
  const redirectHandler = () => {
    navigate("/register");
  };
  return (
    <>
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
      <RedirectInfo
        text="Don't have an account?"
        redirectText="Register"
        redirectHandler={redirectHandler}
      />
    </>
  );
};

export default LoginPageFooter;
