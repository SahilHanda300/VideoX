const serverStore = require("../serverStore");
const { updateFriendsPendingInvitations } = require("./updates/friends");

module.exports = (socket, io) => {
  const userId = socket.userId;
  console.log(
    "[SOCKET] Registering new connection for userId:",
    userId,
    "socketId:",
    socket.id
  );
  if (!userId) return;

  serverStore.addNewConnectedUser({ socketId: socket.id, userId });

  // Emit online users
  io.emit("online-users", { onlineUsers: serverStore.getOnlineUsers() });

  // Emit pending invitations for this user
  updateFriendsPendingInvitations(userId);

  // Emit friends list for this user
  const { updateFriends } = require("./updates/friends");
  updateFriends(userId);
};
