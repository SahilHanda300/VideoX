import React from "react";
import CustomButton from "../../shared/components/CustomButton";
import RedirectInfo from "../../shared/components/RedirectInfo";
import { useNavigate } from "react-router-dom";
import { Tooltip } from "@mui/material";

const RegisterPageFooter = ({ handleRegister, isFormValid }) => {
  const navigate = useNavigate();

  const redirectHandler = () => {
    navigate("/login");
  };
  return (
    <>

      <Tooltip
        title={
          isFormValid
            ? "Click your way to the Dashboard"
            : "Username should be 3 to 15 characters long. Email and Password should be 6 to 12 characters long."
        }
      >
        <div>
          <CustomButton
            label="Register"
            onClick={handleRegister}
            disabled={!isFormValid}
          />
        </div>
      </Tooltip>

      <RedirectInfo
        text="Already have an account? "
        redirectText="Login"
        redirectHandler={redirectHandler}
      />
    </>
  );
};

export default RegisterPageFooter;
