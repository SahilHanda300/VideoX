import { React, useEffect } from "react";
import Messages from "./Messages/Messages";
import NewMessageInput from "./NewMessageInput";
import { getDirectChatHistory } from "../../realTimeCommunication/socketConnection";

const MessengerContent = ({ chosenChatDetails }) => {
  useEffect(() => {
    if (chosenChatDetails) {
      console.log("[MessengerContent] Selected chat:", chosenChatDetails);
      getDirectChatHistory({ recieverId: chosenChatDetails?._id });
    }
  }, [chosenChatDetails]);
  
  return (
    <div className="flex flex-1 h-full">
      <Messages />
    </div>
  );
};

export default MessengerContent;
