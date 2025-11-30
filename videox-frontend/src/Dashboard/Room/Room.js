import React from "react";
import { useSelector } from "react-redux";
import RoomButtons from "./RoomButtons";
import MeshVideoRoom from "./MeshVideoRoom";
import { useRef } from "react";

const Room = ({ onLeaveRoom }) => {
  const roomDetails = useSelector((state) => state.room.roomDetails);
  const roomId = roomDetails?.roomId || roomDetails?._id || "";
  const peerIds = roomDetails?.participants?.map((p) => p.peerId) || [];

  // Debug logging for room and participants
  console.log("[Room] Room details:", {
    roomDetails,
    roomId,
    participants: roomDetails?.participants,
    participantsCount: roomDetails?.participants?.length || 0,
    peerIds,
    peerIdsCount: peerIds.length,
  });
  const fullscreenClass =
    "fixed inset-0 bg-white flex flex-col justify-center items-center z-50 transition-all duration-300 w-full h-full min-h-screen min-w-[320px] p-2 sm:p-4 md:p-8 overflow-auto";
  const screenShareSetterRef = useRef(null);
  return (
    <div className={fullscreenClass}>
      <div className="w-full h-full flex flex-col items-center justify-center relative overflow-auto">
        <div className="w-full h-full flex flex-wrap gap-4 items-center justify-center">
          <MeshVideoRoom
            roomId={roomId}
            peerIds={peerIds}
            isFullscreen={true}
            setScreenSharingStream={(fn) => {
              screenShareSetterRef.current = fn;
            }}
            controls={
              <RoomButtons
                isMinimized={false}
                setIsMinimized={() => {}}
                setScreenSharingStream={screenShareSetterRef.current}
                onLeaveRoom={onLeaveRoom}
              />
            }
          />
        </div>
      </div>
    </div>
  );
};

export default Room;
