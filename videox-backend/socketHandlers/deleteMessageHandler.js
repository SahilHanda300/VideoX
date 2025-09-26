const Message = require("../models/message");
const Conversation = require("../models/conversation");
const chatUpdates = require("./updates/chat");

const deleteMessageHandler = async (socket, data) => {
  try {
    const { userId } = socket.user;
    const { messageId } = data;

    console.log("[SOCKET] Delete message request:", { messageId, userId });

    // Find the message and verify ownership
    const message = await Message.findById(messageId);
    if (!message) {
      console.log("[SOCKET] Message not found:", messageId);
      return;
    }

    // Check if user owns the message
    if (message.author.toString() !== userId) {
      console.log("[SOCKET] User not authorized to delete message:", userId);
      return;
    }

    // Find the conversation before deleting the message
    const conversation = await Conversation.findOne({
      messages: messageId,
    });

    // Remove message from conversation
    if (conversation) {
      conversation.messages = conversation.messages.filter(
        (id) => id.toString() !== messageId
      );
      await conversation.save();
    }

    // Delete the message
    await Message.findByIdAndDelete(messageId);

    console.log("[SOCKET] Message deleted successfully:", messageId);

    if (conversation) {
      // Update chat history for all participants
      chatUpdates.updateChatHistory(conversation._id.toString());
    }
  } catch (err) {
    console.error("Error deleting message:", err);
  }
};

module.exports = deleteMessageHandler;
