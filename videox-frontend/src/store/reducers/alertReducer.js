import alertActions from "../../actions/alertActions";

const initState = {
  showAlert: false,
  alertMessageContent: null,
};

// Reducer for alert notifications
const alertReducer = (state = initState, action) => {
  switch (action.type) {
    case alertActions.OPEN_ALERT_MESSAGE:
      return {
        ...state,
        showAlert: true,
        alertMessageContent: action.messageContent,
      };
    case alertActions.CLOSE_ALERT_MESSAGE:
      return {
        ...state,
        showAlert: false,
        alertMessageContent: null,
      };
    default:
      return state;
  }
};

export default alertReducer;
