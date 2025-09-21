const mongoose = require("mongoose");

// Schema for friend invitations
const friendsInvitationSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // User sending invitation
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // User receiving invitation
});

module.exports = mongoose.model("FriendsInvitation", friendsInvitationSchema); // FriendsInvitation model
