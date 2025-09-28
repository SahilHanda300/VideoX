import alertActions from "../../actions/alertActions";

const initState = {
  showAlert: false,
  alertMessageContent: "",
};

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
        alertMessageContent: "",
      };
    default:
      return state;
  }
};

export default alertReducer;
