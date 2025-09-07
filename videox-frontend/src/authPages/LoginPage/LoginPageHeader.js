import React from "react";
import { Typography } from "@mui/material";
const LoginPageHeader = () => {
  return (
    <>
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
