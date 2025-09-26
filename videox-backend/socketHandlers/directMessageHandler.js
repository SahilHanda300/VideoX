const Message = require("../models/message");
const Conversation = require("../models/conversation");
const chatHistory = require("./updates/chat");
const directMessageHandler = async (socket, data) => {
  try {
    const { userId } = socket;
    const { recieverUserId, content } = data;

    const message = await Message.create({
      content,
      author: userId,
      date: new Date(),
      type: "DIRECT",
    });

    const conversation = await Conversation.findOne({
      participants: { $all: [userId, recieverUserId] },
    });

    if (!conversation) {
      const newConversation = new Conversation({
        participants: [userId, recieverUserId],
        messages: [message._id],
      });
      await newConversation.save();
      // Fetch and emit fully populated conversation
      await chatHistory.updateChatHistory(newConversation._id.toString());
      return;
    }

    conversation.messages.push(message._id);
    await conversation.save();
    // Fetch and emit fully populated conversation
    await chatHistory.updateChatHistory(conversation._id.toString());
  } catch (err) {
    console.error("Error handling direct message:", err);
  }
};

module.exports = directMessageHandler;
