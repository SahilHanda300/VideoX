import roomActions from "../../actions/roomActions";
import {
  TOGGLE_AUDIO,
  START_SCREEN_SHARE,
  STOP_SCREEN_SHARE,
} from "../../actions/roomActions";

const initState = {
  isUserRoomCreator: null,
  isUserInRoom: false,
  roomDetails: null,
  activeRooms: [],
  // localStream and screenSharingStream are now managed in component state, not Redux
  remoteStreams: [],
  isScreenSharingActive: false,
  isAudioEnabled: true,
  isVideoEnabled: true, // Always enabled - no toggle
};

const roomReducer = (state = initState, action) => {
  switch (action.type) {
    case roomActions.OPEN_ROOM:
      return {
        ...state,
        isUserInRoom: action.isUserInRoom,
        isUserRoomCreator: action.isUserRoomCreator,
      };
    case roomActions.SET_ROOM_DETAILS:
      // Only log when participant states actually change to reduce console noise
      const prevParticipants = state.roomDetails?.participants;
      const newParticipants = action.roomDetails?.participants;
      const participantsChanged =
        !prevParticipants ||
        JSON.stringify(prevParticipants) !== JSON.stringify(newParticipants);

      if (participantsChanged && newParticipants) {
        console.log(
          "[REDUX] 🔄 Participants updated:",
          newParticipants.map((p) => ({
            username: p.username,
            audio: p.isAudioEnabled,
            video: p.isVideoEnabled,
          }))
        );
      }
      return {
        ...state,
        roomDetails: action.roomDetails,
      };
    case roomActions.SET_ACTIVE_ROOMS:
      console.log("[REDUX] Active rooms updated:", action.activeRooms);
      return {
        ...state,
        activeRooms: action.activeRooms,
      };
    case "ROOM.RESET_ROOM_STATE":
      // Complete room state reset when user leaves
      console.log(
        "[REDUX] 🔄 Resetting room state - disposing room completely"
      );
      return {
        ...initState, // Reset to initial state
        activeRooms: state.activeRooms, // Keep active rooms list for sidebar
      };
    case "ROOM.REMOVE_ROOM_FROM_ACTIVE":
      // Remove specific room from active rooms list
      const filteredRooms = state.activeRooms.filter(
        (room) => room.roomId !== action.roomId && room._id !== action.roomId
      );
      console.log(`[REDUX] 🗑️ Removed room ${action.roomId} from active rooms`);
      return {
        ...state,
        activeRooms: filteredRooms,
      };
    case TOGGLE_AUDIO:
      return {
        ...state,
        isAudioEnabled: !state.isAudioEnabled,
      };
    case START_SCREEN_SHARE:
      return {
        ...state,
        isScreenSharingActive: true,
      };
    case STOP_SCREEN_SHARE:
      return {
        ...state,
        isScreenSharingActive: false,
      };
    default:
      return state;
  }
};

export default roomReducer;
