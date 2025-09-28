import React from "react";
import MessagesHeader from "./MessagesHeader";
import { connect } from "react-redux";
import Message from "./Message";
import NewMessageInput from "../NewMessageInput";
import {
  editMessage,
  deleteMessage,
} from "../../../realTimeCommunication/socketConnection";

const Messages = ({ chosenChatDetails, messages }) => {
  
  const handleEditMessage = (messageId, newContent) => {
    editMessage({
      messageId,
      newContent,
      conversationId: chosenChatDetails?._id,
    });
  };

  const handleDeleteMessage = (messageId) => {
    deleteMessage({
      messageId,
      conversationId: chosenChatDetails?._id,
    });
  };
  return (
    // Full height container
    <div
      className="flex-1 flex flex-col h-full w-full relative"
      style={{ minHeight: 0 }}
    >
      <MessagesHeader name={chosenChatDetails?.name} />

      <div
        className="flex flex-col flex-1"
        style={{ position: "relative", minHeight: 0 }}
      >

        <div className="flex-1 overflow-y-auto px-4 py-2 flex flex-col gap-2">
          {messages.map((message, index) => {
            const author = message.author || {};
            const username = author.username || "Unknown";
            const sameAuthor =
              index > 0 &&
              messages[index].author &&
              messages[index - 1].author &&
              messages[index].author._id === messages[index - 1].author._id;
            const sameDay =
              index > 0 &&
              new Date(messages[index].date).toDateString() ===
                new Date(messages[index - 1].date).toDateString();
            return (
              <Message
                key={message._id}
                messageId={message._id}
                content={message.content}
                username={username}
                date={message.date}
                author={author}
                edited={message.edited}
                editedAt={message.editedAt}
                sameAuthor={sameAuthor}
                sameDay={sameDay}
                onEdit={handleEditMessage}
                onDelete={handleDeleteMessage}
              />
            );
          })}
        </div>

        <NewMessageInput chosenChatDetails={chosenChatDetails} />
      </div>
    </div>
  );
};

const mapStoreStateToProps = ({ chat }) => ({
  ...chat,
});

export default connect(mapStoreStateToProps)(Messages);
