const Message = require("../models/message");
const Conversation = require("../models/conversation");
const chatUpdates = require("./updates/chat");

const editMessageHandler = async (socket, data) => {
  try {
    const { userId } = socket.user;
    const { messageId, newContent } = data;

    console.log("[SOCKET] Edit message request:", {
      messageId,
      newContent,
      userId,
    });

    // Find the message and verify ownership
    const message = await Message.findById(messageId);
    if (!message) {
      console.log("[SOCKET] Message not found:", messageId);
      return;
    }

    // Check if user owns the message
    if (message.author.toString() !== userId) {
      console.log("[SOCKET] User not authorized to edit message:", userId);
      return;
    }

    // Update the message content
    message.content = newContent;
    message.edited = true;
    message.editedAt = new Date();
    await message.save();

    console.log("[SOCKET] Message edited successfully:", messageId);

    // Find the conversation to update all participants
    const conversation = await Conversation.findOne({
      messages: messageId,
    });

    if (conversation) {
      // Update chat history for all participants
      chatUpdates.updateChatHistory(conversation._id.toString());
    }
  } catch (err) {
    console.error("Error editing message:", err);
  }
};

module.exports = editMessageHandler;
