import React from "react";
import { useSelector } from "react-redux";
import MainPageButton from "./MainPageButton";
import CreateRoomButton from "./CreateRoomButton";
import ActiveRoomsList from "./ActiveRoomsList";

const Sidebar = () => {
  const activeRooms = useSelector((state) => state.room.activeRooms);
  const friends = useSelector((state) => state.friends.friends);
  const user = useSelector((state) => state.auth.user);
  // Debug logs
  console.log("[DEBUG] activeRooms:", activeRooms);
  console.log("[DEBUG] friends:", friends);
  console.log("[DEBUG] user:", user);
  const friendIds = friends.map((f) => f._id);
  // Show rooms created by the user or their friends
  const filteredRooms = activeRooms.filter(
    (room) =>
      room.roomCreator.userId === user?._id ||
      friendIds.includes(room.roomCreator.userId)
  );
  return (
    <div className="h-full w-[100px] bg-gray-300 flex flex-col items-center">
      <MainPageButton />
      <CreateRoomButton />
      <ActiveRoomsList activeRooms={filteredRooms} />
    </div>
  );
};

export default Sidebar;
