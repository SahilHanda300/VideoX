import React from "react";
import { Typography } from "@mui/material";
const RedirectInfo = ({ text, redirectText, redirectHandler }) => {
  return (
    <div className="mt-5">
      <Typography variant="body2" color="textSecondary">
        {text}
      </Typography>
      <Typography
        variant="body2"
        color="primary"
        onClick={redirectHandler}
        className="cursor-pointer"
      >
        {redirectText}
      </Typography>
    </div>
  );
};

export default RedirectInfo;
