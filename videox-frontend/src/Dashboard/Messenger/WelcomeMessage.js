import React from "react";
import { Typography } from "@mui/material";
// Shown when no chat is selected
const WelcomeMessage = () => {
  return (
    <div className="flex items-center justify-center h-full flex-col">
      <Typography variant="h4">Welcome to the Messenger!</Typography>
      <br />
      <Typography variant="h5">
        Select a conversation to start chatting.
      </Typography>
    </div>
  );
};

export default WelcomeMessage;
