const FriendsInvitation = require("../../models/friends");
const serverStore = require("../../serverStore");
const User = require("../../models/user");

const updateFriendsPendingInvitations = async (userId) => {
  try {
    const pendingInvitations = await FriendsInvitation.find({
      receiverId: userId,
    }).populate("senderId", "_id username mail");

    const receiverList = serverStore.getActiveConnections(userId);
    const io = serverStore.getSocketServerInstance();

    console.log("[SOCKET] Emitting friends-invitations to:", receiverList);
    console.log("[SOCKET] Pending invitations:", pendingInvitations);
    receiverList.forEach((socketId) => {
      io.to(socketId).emit("friends-invitations", {
        pendingInvitations: pendingInvitations ? pendingInvitations : [],
      });
    });
  } catch (err) {
    console.log(err);
  }
};

const updateFriends = async (userId) => {
  const user = await User.findById(userId).populate("friends", "_id username");
  const io = serverStore.getSocketServerInstance();
  const activeSockets = serverStore.getActiveConnections(userId);

  console.log("[SOCKET] Emitting friends-list to:", activeSockets);
  console.log("[SOCKET] Friends:", user.friends);
  activeSockets.forEach((socketId) => {
    io.to(socketId).emit("friends-list", { friends: user.friends });
  });
};

module.exports = { updateFriendsPendingInvitations, updateFriends };
