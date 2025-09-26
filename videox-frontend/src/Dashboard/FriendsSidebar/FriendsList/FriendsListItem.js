// Renders a single friend item with online indicator and chat selection
import React from "react";
import { Button, Avatar } from "@mui/material";
import OnlineIndicator from "./OnlineIndicator";
import { chatTypes, getActions } from "../../../actions/chatActions";
import { connect } from "react-redux";

// Renders a single friend item with online indicator and chat selection
const FriendsListItem = ({ id, username, isOnline, setChosenChatDetails }) => {
  // Handle friend click to select chat
  const handleChooseActiveConversation = () => {
    if (setChosenChatDetails && id && username) {
      setChosenChatDetails({ _id: id, name: username }, chatTypes.DIRECT);
    }
  };
  // Render friend item with avatar, name, and online indicator
  return (
    <Button
      onClick={handleChooseActiveConversation}
      className="w-full flex mt-10 items-center justify-center relative"
      sx={{
        color: "black",
        backgroundColor: "white",
        justifyContent: "flex-start",
        textTransform: "none",
        padding: "0.5rem 1rem",
      }}
    >
      <Avatar sx={{ bgcolor: "lightgray", color: "black" }}>
        {username?.[0]?.toUpperCase() || "?"}
      </Avatar>
      <span className="ml-2 text-black">{username}</span>
      {isOnline && <OnlineIndicator />}
    </Button>
  );
};

const mapActionsToProps = (dispatch) => ({
  ...getActions(dispatch),
});

export default connect(null, mapActionsToProps)(FriendsListItem);
