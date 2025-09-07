import React from "react";
import Box from "@mui/material/Box";

const AuthComp = (props) => {
  return (
    <Box className="w-full h-screen flex flex-col justify-center items-center bg-orange-300">
      <div className="bg-white p-10 rounded-lg shadow-lg w-3/4 h-3/4">
        {props.children}
      </div>
    </Box>
  );
};

export default AuthComp;
