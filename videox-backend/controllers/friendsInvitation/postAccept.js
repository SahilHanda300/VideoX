const FriendsInvitation = require("../../models/friends");
const User = require("../../models/user");
const {
  updateFriendsPendingInvitations,
  updateFriends,
} = require("../../socketHandlers/updates/friends");

const postAccept = async (req, res) => {
  try {
    const { id } = req.body;
    const invitation = await FriendsInvitation.findById(id);

    if (!invitation) {
      return res
        .status(401)
        .json({ success: false, message: "Invitation does not exist" });
    }

    const { senderId, receiverId } = invitation;

    const senderUser = await User.findById(senderId);
    const receiverUser = await User.findById(receiverId);

    if (!senderUser || !receiverUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Add friends only if not already friends
    if (!senderUser.friends.includes(receiverId)) {
      senderUser.friends.push(receiverId);
      console.log(
        `[FRIENDS] Added receiverId ${receiverId} to senderUser ${senderId}`
      );
    }
    if (!receiverUser.friends.includes(senderId)) {
      receiverUser.friends.push(senderId);
      console.log(
        `[FRIENDS] Added senderId ${senderId} to receiverUser ${receiverId}`
      );
    }

    await senderUser.save();
    await receiverUser.save();

    await FriendsInvitation.findByIdAndDelete(id);

    // Update clients
    console.log(
      `[FRIENDS] Calling updateFriends for senderId ${senderId} and receiverId ${receiverId}`
    );
    updateFriends(senderId.toString()); // <-- emits "friends-list" for sender
    updateFriends(receiverId.toString()); // <-- emits "friends-list" for receiver
    updateFriendsPendingInvitations(receiverId.toString()); // <-- pending invites

    return res
      .status(200)
      .json({ success: true, message: "Invitation Accepted" });
  } catch (error) {
    console.error("Error in postAccept:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

module.exports = postAccept;
