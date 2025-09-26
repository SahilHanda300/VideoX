import React, { useState } from "react";
import { connect } from "react-redux";
import { sendDirectMessage } from "../../realTimeCommunication/socketConnection";

// Input component for sending new chat messages
const NewMessageInput = ({ chosenChatDetails }) => {
  const [message, setMessage] = useState("");

  // Debug: log chosenChatDetails on every render
  React.useEffect(() => {}, [chosenChatDetails]);

  const handleSend = () => {
    if (message.trim()) {
      console.log("Sending:", message);

      if (message.length > 0) {
        console.log("chosenChatDetails before send:", chosenChatDetails);
        console.log("recieverUserId:", chosenChatDetails?._id);
        sendDirectMessage({
          recieverUserId: chosenChatDetails?._id,
          content: message,
        });
      }
      setMessage(""); // clear input
    }
  };

  return (
    <div className="w-full flex items-center p-4 border-t bg-white">
      <input
        type="text"
        className="flex-1 rounded-lg border px-4 py-2 mr-2 focus:outline-none 
                   focus:ring-2 focus:ring-orange-500 bg-white text-black border-orange-300"
        placeholder={
          chosenChatDetails
            ? `Message ${chosenChatDetails.name}`
            : "Type a message..."
        }
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSend();
        }}
      />
      <button
        className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition"
        onClick={handleSend}
        disabled={!message.trim()}
      >
        Send
      </button>
    </div>
  );
};

const mapStoreStateToProps = ({ chat }) => ({
  ...chat,
});

export default connect(mapStoreStateToProps)(NewMessageInput);
