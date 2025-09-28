const Conversation = require("../models/conversation");
const Message = require("../models/message");
const chatUpdates = require("./updates/chat");

const directChatHistoryHandler = async (socket, data) => {
  try {
    const { userId } = socket.user;
    const { recieverId } = data;

    const conversation = await Conversation.findOne({
      participants: { $all: [userId, recieverId] },
    });

    if (conversation) {
      chatUpdates.updateChatHistory(conversation._id.toString(), socket.id);
    }
  } catch (err) {
    console.error("Error fetching direct chat history:", err);
  }
};

module.exports = directChatHistoryHandler;
