const Message = require("../models/message");
const Conversation = require("../models/conversation");
const chatUpdates = require("./updates/chat");

const deleteMessageHandler = async (socket, data) => {
  try {
    const { userId } = socket.user;
    const { messageId } = data;

    const message = await Message.findById(messageId);
    if (!message) {
      return;
    }


    if (message.author.toString() !== userId) {
      return;
    }

    const conversation = await Conversation.findOne({
      messages: messageId,
    });

    if (conversation) {
      conversation.messages = conversation.messages.filter(
        (id) => id.toString() !== messageId
      );
      await conversation.save();
    }

    
    await Message.findByIdAndDelete(messageId);

    if (conversation) {
      chatUpdates.updateChatHistory(conversation._id.toString());
    }
  } catch (err) {
    console.error("Error deleting message:", err);
  }
};

module.exports = deleteMessageHandler;
