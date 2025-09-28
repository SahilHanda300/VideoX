import React from "react";
import { connect } from "react-redux";
import WelcomeMessage from "./WelcomeMessage";
import MessengerContent from "./MessengerContent";
// Main messenger area: shows chat or welcome message
const Messenger = ({ chosenChatDetails }) => {
  return (
    <div className="h-full flex flex-col flex-1 bg-orange-100 overflow-hidden">

      {!chosenChatDetails ? (
        <WelcomeMessage />
      ) : (
        <MessengerContent chosenChatDetails={chosenChatDetails} />
      )}
    </div>
  );
};

const mapStoreStateToProps = ({ chat }) => {
  return {
    ...chat,
  };
};
export default connect(mapStoreStateToProps)(Messenger);
