import { chatActions } from "../../actions/chatActions";

const initState = {
  chosenChatDetails: null,
  chatType: null,
  messages: [],
};

const chatReducer = (state = initState, action) => {
  switch (action.type) {
    case chatActions.SET_CHOSEN_CHAT_DETAILS:
      const details = action.details || {};
      const safeDetails = {
        ...details,
        name: details.name && details.name.trim() ? details.name : "User",
      };
      return {
        ...state,
        chosenChatDetails: safeDetails,
        chatType: action.chatType,
        messages: state.messages,
      };
    case chatActions.SET_MESSAGES:
      return {
        ...state,
        messages: action.messages,
      };
    default:
      return state;
  }
};

export default chatReducer;
