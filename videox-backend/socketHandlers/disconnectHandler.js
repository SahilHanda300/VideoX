const serverStore = require("../serverStore");

module.exports = (socket) => {
  serverStore.removeConnectedUser(socket.id);
  const io = serverStore.getSocketServerInstance();
  if (io) {
    const onlineUsers = serverStore.getOnlineUsers();
    io.emit("online-users", { onlineUsers });
    console.log(
      "[SOCKET] Emitted updated online-users after disconnect:",
      onlineUsers
    );
  }
};
