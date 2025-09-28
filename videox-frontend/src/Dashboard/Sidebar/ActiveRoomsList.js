import React from "react";
import { joinRoom } from "../../realTimeCommunication/roomHandler";

const ActiveRoomsList = ({ activeRooms }) => {
  if (!activeRooms || activeRooms.length === 0) {
    return (
      <div className="text-xs text-gray-500 mt-4 text-center">
        No active rooms
      </div>
    );
  }
  // Only allow joining if socket is connected
  const socketConnection = require("../../realTimeCommunication/socketConnection");
  const socket = socketConnection.getSocket();
  const canJoin = socket && socket.connected;
  return (
    <div className="mt-4 flex flex-col items-center gap-2">
      {activeRooms.map((room) => (
        <div
          key={room.roomId}
          className={`w-10 h-10 bg-orange-300 rounded-full flex items-center justify-center text-lg font-bold shadow ${
            canJoin
              ? "hover:bg-orange-400 cursor-pointer"
              : "opacity-50 cursor-not-allowed"
          }`}
          title={
            canJoin ? `Room by ${room.roomCreator.userId}` : "Connecting..."
          }
          onClick={() => canJoin && joinRoom(room.roomId)}
        >
          {room.roomCreator.username
            ? room.roomCreator.username.charAt(0).toUpperCase()
            : "?"}
        </div>
      ))}
    </div>
  );
};

export default ActiveRoomsList;
