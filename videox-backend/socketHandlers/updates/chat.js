const Conversation = require("../../models/conversation");
const Message = require("../../models/message");
const serverStore = require("../../serverStore");

const updateChatHistory = async (conversationId, toSpecificSocketId) => {
  const conversation = await Conversation.findById(conversationId).populate({
    path: "messages",
    model: "Message",
    populate: { path: "author", model: "User", select: "username _id" },
  });

  if (conversation) {
    const io = serverStore.getSocketServerInstance();

    if (toSpecificSocketId) {
      console.log(
        "[SOCKET] Emitting direct-chat-history to specific socket:",
        toSpecificSocketId
      );
      console.log(
        "[SOCKET] Messages:",
        JSON.stringify(conversation.messages, null, 2)
      );
      console.log("[SOCKET] Participants:", conversation.participants);
      return io
        .to(toSpecificSocketId)
        .emit("direct-chat-history", {
          messages: conversation.messages,
          participants: conversation.participants,
        });
    }

    conversation.participants.forEach((participantId) => {
      const activeConnections = serverStore.getActiveConnections(
        participantId.toString()
      );
      activeConnections.forEach((socketId) => {
        console.log("[SOCKET] Emitting direct-chat-history to:", socketId);
        console.log(
          "[SOCKET] Messages:",
          JSON.stringify(conversation.messages, null, 2)
        );
        console.log("[SOCKET] Participants:", conversation.participants);
        io.to(socketId).emit("direct-chat-history", {
          messages: conversation.messages,
          participants: conversation.participants,
        });
      });
    });
  }
};

module.exports = { updateChatHistory };
