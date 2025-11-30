export const TOGGLE_AUDIO = "ROOM.TOGGLE_AUDIO";
export const START_SCREEN_SHARE = "ROOM.START_SCREEN_SHARE";
export const STOP_SCREEN_SHARE = "ROOM.STOP_SCREEN_SHARE";

export const toggleAudio = () => ({ type: TOGGLE_AUDIO });
export const startScreenShare = (stream) => ({
  type: START_SCREEN_SHARE,
  stream,
});
export const stopScreenShare = () => ({ type: STOP_SCREEN_SHARE });
export const roomActions = {
  OPEN_ROOM: "ROOM.OPEN_ROOM",
  SET_ROOM_DETAILS: "ROOM.SET_ROOM_DETAILS",
  SET_ACTIVE_ROOMS: "ROOM.SET_ACTIVE_ROOMS",
  SET_LOCAL_STREAM: "ROOM.SET_LOCAL_STREAM",
  SET_REMOTE_STREAMS: "ROOM.SET_REMOTE_STREAMS",
  SET_SCREEN_SHARE_STREAM: "ROOM.SET_SCREEN_SHARE_STREAM",
};
export default roomActions;

export const setOpenRoom = (
  isUserRoomCreator = false,
  isUserInRoom = false
) => {
  return {
    type: roomActions.OPEN_ROOM,
    isUserRoomCreator,
    isUserInRoom,
  };
};

export const setRoomDetails = (roomDetails) => {
  return {
    type: roomActions.SET_ROOM_DETAILS,
    roomDetails: roomDetails,
  };
};

export const setLocalStream = (localStream) => {
  return {
    type: roomActions.SET_LOCAL_STREAM,
    localStream,
  };
};
