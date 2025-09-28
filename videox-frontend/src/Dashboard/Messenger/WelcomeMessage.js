import React from "react";
import { Typography } from "@mui/material";

const WelcomeMessage = () => {
  return (
    <div className="flex items-center justify-center h-full flex-col px-4 text-center">
      <Typography
        variant="h4"
        className="text-2xl md:text-3xl lg:text-4xl mb-4"
      >
        Welcome to the Messenger!
      </Typography>
      <Typography variant="h5" className="text-lg md:text-xl lg:text-2xl">
        Select a conversation to start chatting.
      </Typography>
    </div>
  );
};

export default WelcomeMessage;
