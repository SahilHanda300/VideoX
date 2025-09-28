const serverStore = require("../serverStore");
const updateRooms = require("./updates/rooms");

const roomLeaveHandler = async (socket, data) => {
  const { roomId } = data;
  const userId = socket.user.userId;

  let room = (serverStore.activeRooms || []).find((r) => r.roomId === roomId);
  if (!room) {
    socket.emit("room-leave-failed", { message: "Room not found." });
    return;
  }

  const updatedParticipants = room.participants.filter(
    (p) => String(p.userId) !== String(userId)
  );

  if (updatedParticipants.length === 0) {
    // Remove the room if no participants left
    serverStore.activeRooms = serverStore.activeRooms.filter(
      (r) => r.roomId !== roomId
    );
  } else {
    
    serverStore.activeRooms = serverStore.activeRooms.map((r) =>
      r.roomId === roomId ? { ...r, participants: updatedParticipants } : r
    );
    
  }

  
  socket.leave(roomId);
  
  socket.emit("room-leave-success", { roomId });
  
  socket.to(roomId).emit("room-user-left", { userId });

  updateRooms();
};

module.exports = roomLeaveHandler;
