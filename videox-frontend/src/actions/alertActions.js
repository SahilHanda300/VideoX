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
  return {
    type: alertActions.OPEN_ALERT_MESSAGE,
    messageContent,
  };
}

export const closeAlertMessage = () => {
  return {
    type: alertActions.CLOSE_ALERT_MESSAGE,
  };
}


export default alertActions;