import { React, useEffect } from "react";
import Messages from "./Messages/Messages";
import NewMessageInput from "./NewMessageInput";
import { getDirectChatHistory } from "../../realTimeCommunication/socketConnection";
// Messenger content: loads chat history for selected chat
const MessengerContent = ({ chosenChatDetails }) => {
  useEffect(() => {
    if (chosenChatDetails) {
      console.log("[MessengerContent] Selected chat:", chosenChatDetails);
      getDirectChatHistory({ recieverId: chosenChatDetails?._id });
      // Fetch messages for the selected chat
    }
  }, [chosenChatDetails]);
  // Render messages area
  return (
    <div className="flex flex-1 h-full">
      <Messages />
    </div>
  );
};

export default MessengerContent;
