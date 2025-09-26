const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define message schema fields
const messageSchema = new mongoose.Schema({
  author: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  content: { type: String },
  date: { type: Date },
  type: { type: String },
  edited: { type: Boolean, default: false },
  editedAt: { type: Date },
});

const Message = mongoose.model("Message", messageSchema);
module.exports = Message;
