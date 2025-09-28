const serverStore = require("../../serverStore");

// Helper to fetch friends for a userId (replace with actual DB call as needed)
const getFriendsForUser = async (userId) => {
  // TODO: Replace with actual DB call to fetch friends
  // Example: return await User.findById(userId).select('friends').lean();
  // For now, return an empty array
  return [];
};

// toSpecifiedTargetId: socket id
// userId: id of the user to whom we are broadcasting
const updateRooms = async (toSpecifiedTargetId = null, userId = null) => {
  const io = serverStore.getSocketServerInstance();
  if (!io) return;

  let activeRooms = serverStore.activeRooms || [];

  // If userId is provided, filter rooms to only those created by friends or self
  if (userId) {
    const friends = await getFriendsForUser(userId);
    // friends should be an array of userIds
    const allowedUserIds = new Set([userId, ...friends]);
    activeRooms = activeRooms.filter((room) =>
      allowedUserIds.has(room.creatorUserId)
    );
  }

  if (toSpecifiedTargetId) {
    console.log(`Broadcasting active rooms to socket: ${toSpecifiedTargetId}`);
    io.to(toSpecifiedTargetId).emit("active-rooms", { activeRooms });
  } else {
    console.log("Broadcasting active rooms to all online users");
    io.emit("active-rooms", { activeRooms });
  }
};

module.exports = updateRooms;
