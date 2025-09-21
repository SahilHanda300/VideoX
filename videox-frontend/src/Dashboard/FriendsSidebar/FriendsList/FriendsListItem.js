import React from "react";
import { Button, Avatar } from "@mui/material";
import OnlineIndicator from "./OnlineIndicator";

const FriendsListItem = ({ key, name, isOnline }) => {
  return (
    <Button
      className="w-full flex mt-10 items-center justify-center relative"
      sx={{
        color: "black",
        backgroundColor: "white",
        justifyContent: "flex-start",
        textTransform: "none", // keep original casing
        padding: "0.5rem 1rem",
      }}
    >
      <Avatar sx={{ bgcolor: "lightgray", color: "black" }}>
        {name?.[0]?.toUpperCase() || "?"}
      </Avatar>
      <span className="ml-2 text-black">{name}</span>
      {isOnline && <OnlineIndicator />}
    </Button>
  );
};

export default FriendsListItem;
