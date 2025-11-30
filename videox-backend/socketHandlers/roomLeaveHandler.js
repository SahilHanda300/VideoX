const serverStore = require("../serverStore");
const updateRooms = require("./updates/rooms");

const roomLeaveHandler = async (socket, data) => {
  const { roomId } = data;
  const userId = socket.user.userId;

  console.log(`[BACKEND] 🚪 User ${userId} leaving room ${roomId}`);

  let room = (serverStore.activeRooms || []).find((r) => r.roomId === roomId);
  if (!room) {
    console.log(`[BACKEND] ❌ Room ${roomId} not found`);
    socket.emit("room-leave-failed", { message: "Room not found." });
    return;
  }

  const updatedParticipants = room.participants.filter(
    (p) => String(p.userId) !== String(userId)
  );

  if (updatedParticipants.length === 0) {
    // Remove the room if no participants left
    console.log(`[BACKEND] 🗑️ Removing empty room ${roomId}`);
    serverStore.activeRooms = serverStore.activeRooms.filter(
      (r) => r.roomId !== roomId
    );
  } else {
    console.log(
      `[BACKEND] 👥 Room ${roomId} has ${updatedParticipants.length} participants remaining`
    );
    serverStore.activeRooms = serverStore.activeRooms.map((r) =>
      r.roomId === roomId ? { ...r, participants: updatedParticipants } : r
    );
  }

  // Leave socket room
  socket.leave(roomId);

  // Confirm to the leaving user
  socket.emit("room-leave-success", { roomId });

  // Notify other participants in the room
  socket.to(roomId).emit("room-user-left", { userId });

  // Broadcast updated room list to all users
  console.log(
    `[BACKEND] 📡 Broadcasting updated room list after user ${userId} left`
  );
  await updateRooms();

  // Give specific update to the leaving user to ensure they get fresh room list
  setTimeout(async () => {
    await updateRooms(socket.id, userId);
    console.log(
      `[BACKEND] ✅ Sent updated room list to leaving user ${userId}`
    );
  }, 100);
};

module.exports = roomLeaveHandler;
