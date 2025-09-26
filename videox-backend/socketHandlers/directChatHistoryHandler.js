const Conversation = require("../models/conversation");
const Message = require("../models/message");
const chatUpdates = require("./updates/chat");

const directChatHistoryHandler = async (socket, data) => {
  try {
    const { userId } = socket.user;
    const { recieverId } = data;

    console.log(
      "[SOCKET] direct-chat-history requested by:",
      userId,
      "for:",
      recieverId
    );

    const conversation = await Conversation.findOne({
      participants: { $all: [userId, recieverId] },
    });

    if (conversation) {
      console.log("[SOCKET] Conversation found:", conversation._id.toString());
      chatUpdates.updateChatHistory(conversation._id.toString(), socket.id);
    } else {
      console.log(
        "[SOCKET] No conversation found for participants:",
        userId,
        recieverId
      );
    }
  } catch (err) {
    console.error("Error fetching direct chat history:", err);
  }
};

module.exports = directChatHistoryHandler;
