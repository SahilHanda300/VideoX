import React from "react";
import { Alert } from "@mui/material";
import { connect } from "react-redux";
import Snackbar from "@mui/material/Snackbar";
import { getActions } from "../../actions/alertActions";

const AlertNotification = ({
  showAlert,
  closeAlertMessage,
  alertMessageContent,
}) => {
  const isOpen =
    showAlert &&
    typeof alertMessageContent === "string" &&
    alertMessageContent.length > 0;

  return (
    <Snackbar
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      open={isOpen}
      onClose={closeAlertMessage}
      autoHideDuration={3000}
    >
      <Alert severity="info" onClose={closeAlertMessage}>
        {alertMessageContent}
      </Alert>
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
