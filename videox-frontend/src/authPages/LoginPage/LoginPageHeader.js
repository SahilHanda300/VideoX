import React from "react";
import { Typography } from "@mui/material";
// Header for login page
const LoginPageHeader = () => {
  return (
    <>
      {/* Title for login page */}
      <Typography
        variant="h3"
        sx={{ fontSize: { xs: "1.5rem", lg: "2rem" } }}
        gutterBottom
      >
        Welcome Back!
      </Typography>
    </>
  );
};

export default LoginPageHeader;
