const alertActions = {
  OPEN_ALERT_MESSAGE: "OPEN_ALERT_MESSAGE",
  CLOSE_ALERT_MESSAGE: "CLOSE_ALERT_MESSAGE",
};

export const getActions = (dispatch) => {
  return {
    openAlertMessage: (messageContent) =>
      dispatch(openAlertMessage(messageContent)),
    closeAlertMessage: () => dispatch(closeAlertMessage()),
  };
};

export const openAlertMessage = (messageContent) => {
  let message = messageContent;
  if (typeof messageContent === "object") {
    message = messageContent.message || JSON.stringify(messageContent);
  }
  return {
    type: alertActions.OPEN_ALERT_MESSAGE,
    messageContent: String(message || ""),
  };
};

export const closeAlertMessage = () => {
  return {
    type: alertActions.CLOSE_ALERT_MESSAGE,
  };
};

export default alertActions;
