const User = require("../../models/user");
const FriendsInvitation = require("../../models/friends");
const friendsUpdates = require("../../socketHandlers/updates/friends");

const postInvite = async (req, res) => {
  try {
    const { targetMailAddress } = req.body;
    const { userId, mail } = req.user;

    if (mail.toLowerCase() === targetMailAddress.toLowerCase()) {
      return res.status(409).json({ message: "You cannot invite yourself." });
    }

    const targetUser = await User.findOne({ mail: targetMailAddress });
    if (!targetUser) {
      return res.status(404).json({ message: "User with this email does not exist." });
    }

    const existingInvitation = await FriendsInvitation.findOne({
      senderId: userId,
      receiverId: targetUser._id,
    });

    if (existingInvitation) {
      return res.status(409).json({ message: "Invitation already sent." });
    }


    
    const invitation = await FriendsInvitation.create({
      senderId: userId,
      receiverId: targetUser._id,
    });

    friendsUpdates.updateFriendsPendingInvitations(targetUser._id.toString());
    
    return res.status(201).json({ message: "Invitation sent successfully", invitation });
  } catch (err) {
    console.error("Error in postInvite:", err);
    return res.status(500).json({ message: "Internal server error", error: err.message });
  }
};

module.exports = postInvite;
