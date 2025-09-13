import React from "react";
import { Alert } from "@mui/material";
import { connect } from "react-redux";
import Snackbar from "@mui/material/Snackbar";
import { getActions } from "../../actions/alertActions";

const AlertNotification = ({
  openAlertMessage,
  closeAlertMessage,
  alertMessageContent,
}) => {
  const isOpen = openAlertMessage && Boolean(alertMessageContent?.trim());

  return (
    <Snackbar
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      open={isOpen}
      onClose={closeAlertMessage}
    >
      <Alert severity="info">{alertMessageContent}</Alert>
    </Snackbar>
  );
};

const mapStoreStateToProps = ({ alert }) => {
  return {
    ...alert,
  };
};

const mapActionsToProps = (dispatch) => {
  return {
    ...getActions(dispatch),
  };
};

export default connect(
  mapStoreStateToProps,
  mapActionsToProps
)(AlertNotification);
