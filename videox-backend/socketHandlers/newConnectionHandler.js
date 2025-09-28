const serverStore = require("../serverStore");
const { updateFriendsPendingInvitations } = require("./updates/friends");
const updateRooms = require("./updates/rooms");

module.exports = (socket, io) => {
  const userId = socket.userId;
  
  if (!userId) return;

  serverStore.addNewConnectedUser({ socketId: socket.id, userId });

  
  io.emit("online-users", { onlineUsers: serverStore.getOnlineUsers() });

  
  updateFriendsPendingInvitations(userId);

  
  const { updateFriends } = require("./updates/friends");
  updateFriends(userId);

  updateRooms(socket.id);
};
