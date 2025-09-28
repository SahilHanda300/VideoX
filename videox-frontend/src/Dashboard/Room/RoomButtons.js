import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { leaveRoom } from "../../realTimeCommunication/roomHandler";
import {
  toggleAudio,
  toggleVideo,
  startScreenShare,
  stopScreenShare,
} from "../../actions/roomActions";

const RoomButtons = ({
  isMinimized,
  setIsMinimized,
  setScreenSharingStream,
  onLeaveRoom,
}) => {
  const dispatch = useDispatch();
  const roomDetails = useSelector((state) => state.room.roomDetails);
  const roomId = roomDetails?.roomId;
  const isAudioEnabled = useSelector((state) => state.room.isAudioEnabled);
  const isVideoEnabled = useSelector((state) => state.room.isVideoEnabled);
  const isScreenSharingActive = useSelector(
    (state) => state.room.isScreenSharingActive
  );
  return (
    <div
      className={
        isMinimized
          ? "flex gap-2 px-2 py-2 rounded-xl bg-black/70 backdrop-blur-md shadow-md w-[95%] mx-auto justify-center items-center"
          : "flex gap-4 px-6 py-3 rounded-2xl bg-black/70 backdrop-blur-md shadow-lg w-full justify-center items-center mt-4"
      }
      style={
        isMinimized
          ? { position: "static", fontSize: "14px", minHeight: "40px" }
          : { position: "static" }
      }
    >

      <button
        className="bg-red-500 text-white rounded-full p-3 shadow hover:bg-red-600 transition"
        title="Leave Room"
        onClick={() => {
          if (roomId) leaveRoom(roomId);
          if (typeof onLeaveRoom === "function") onLeaveRoom();
        }}
        disabled={!roomId}
        style={{ marginLeft: "8px" }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
      <button
        className={`rounded-full p-3 shadow transition ${
          isAudioEnabled
            ? "bg-white text-orange-500 hover:bg-orange-100"
            : "bg-orange-500 text-white hover:bg-orange-600"
        }`}
        title={isAudioEnabled ? "Mute Audio" : "Unmute Audio"}
        onClick={() => {
          dispatch(toggleAudio());
        }}
      >
        {isAudioEnabled ? (
          // Mic on
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M10 2a2 2 0 00-2 2v6a2 2 0 104 0V4a2 2 0 00-2-2zm5 8a1 1 0 10-2 0 3 3 0 01-6 0 1 1 0 10-2 0 5 5 0 004 4.9V17a1 1 0 102 0v-2.1A5 5 0 0015 10z" />
          </svg>
        ) : (
          // Mic off
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5v6a3 3 0 006 0V5m-6 0a3 3 0 016 0m-6 0v6a3 3 0 006 0V5m-6 0a3 3 0 016 0M19 19l-6-6"
            />
          </svg>
        )}
      </button>
      <button
        className={`rounded-full p-3 shadow transition ${
          isVideoEnabled
            ? "bg-white text-orange-500 hover:bg-orange-100"
            : "bg-orange-500 text-white hover:bg-orange-600"
        }`}
        title={isVideoEnabled ? "Turn Off Video" : "Turn On Video"}
        onClick={() => {
          // Clone stream if needed, never mutate Redux state
          dispatch(toggleVideo());
        }}
      >
        {isVideoEnabled ? (
          // Video on
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M4 6v12a2 2 0 002 2h8a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2z"
            />
          </svg>
        ) : (
          // Video off
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M4 6v12a2 2 0 002 2h8a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2zM3 3l18 18"
            />
          </svg>
        )}
      </button>
      <button
        className={`rounded-full p-3 shadow transition ${
          isScreenSharingActive
            ? "bg-orange-500 text-white hover:bg-orange-600"
            : "bg-white text-orange-500 hover:bg-orange-100"
        }`}
        title={
          isScreenSharingActive ? "Stop Screen Share" : "Start Screen Share"
        }
        onClick={async () => {
          if (isScreenSharingActive) {
            dispatch(stopScreenShare());
            if (setScreenSharingStream) setScreenSharingStream(null);
          } else {
            try {
              const stream = await navigator.mediaDevices.getDisplayMedia({
                video: true,
              });
              dispatch(startScreenShare()); // Only update boolean in Redux
              if (setScreenSharingStream) setScreenSharingStream(stream);
            } catch (err) {
              alert("Could not start screen sharing: " + err.message);
            }
          }
        }}
      >
        {isScreenSharingActive ? (
          // Screen share on
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.75 17L12 19.25 14.25 17M12 19.25V10.75"
            />
            <rect
              width="20"
              height="14"
              x="2"
              y="5"
              rx="2"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>
        ) : (
          // Screen share off
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <rect
              width="20"
              height="14"
              x="2"
              y="5"
              rx="2"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 10.75V19.25M9.75 17L12 19.25 14.25 17"
            />
          </svg>
        )}
      </button>
      <button
        className="bg-red-500 text-white rounded-full p-3 shadow hover:bg-red-600 transition"
        title="Leave Room"
        onClick={() => {
          if (roomId) leaveRoom(roomId);
          if (typeof onLeaveRoom === "function") onLeaveRoom();
        }}
        disabled={!roomId}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2v1"
          />
        </svg>
      </button>
    </div>
  );
};

export default RoomButtons;
