const serverStore = require("../serverStore");

const updateRooms = require("./updates/rooms");

module.exports = (socket) => {
  serverStore.removeConnectedUser(socket.id);
  const io = serverStore.getSocketServerInstance();
  let userId = null;
  for (const room of serverStore.activeRooms) {
    const participant = room.participants.find((p) => p.socketId === socket.id);
    if (participant) {
      userId = participant.userId;
      room.participants = room.participants.filter(
        (p) => p.socketId !== socket.id
      );
      if (io && room.participants.length > 0) {
        room.participants.forEach((p) => {
          io.to(p.socketId).emit("room-details-updated", { roomDetails: room });
        });
      }
    }
  }

  serverStore.activeRooms = serverStore.activeRooms.filter(
    (room) => room.participants.length > 0
  );
  
  updateRooms();
  if (io) {
    const onlineUsers = serverStore.getOnlineUsers();
    io.emit("online-users", { onlineUsers });
  }
};
