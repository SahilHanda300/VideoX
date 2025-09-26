const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define conversation schema fields
const conversationSchema = new mongoose.Schema({
  participants: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  messages: [
    {
      type: Schema.Types.ObjectId,
      ref: "Message",
    },
  ],
});

const Conversation = mongoose.model("Conversation", conversationSchema);
module.exports = Conversation;
