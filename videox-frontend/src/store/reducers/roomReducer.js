import roomActions from "../../actions/roomActions";
import {
  TOGGLE_AUDIO,
  TOGGLE_VIDEO,
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
  isVideoEnabled: true,
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
    case TOGGLE_AUDIO:
      return {
        ...state,
        isAudioEnabled: !state.isAudioEnabled,
      };
    case TOGGLE_VIDEO:
      return {
        ...state,
        isVideoEnabled: !state.isVideoEnabled,
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
