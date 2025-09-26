import { React, useEffect } from "react";
import CheckIcon from "@mui/icons-material/Check";
import ClearIcon from "@mui/icons-material/Clear";
import { IconButton } from "@mui/material";
// Renders accept/reject buttons for friend invitation
const InvitationDecisionButtons = ({
  acceptInvitationHandler,
  rejectInvitationHandler,
  disabled,
}) => {
  return (
    <div>
      {/* Accept invitation button */}
      <IconButton
        style={{ color: "orange", paddingLeft: "2rem" }}
        disabled={disabled}
        onClick={acceptInvitationHandler}
      >
        <CheckIcon />
      </IconButton>
      {/* Reject invitation button */}
      <IconButton
        style={{ color: "orange", paddingLeft: "2rem" }}
        disabled={disabled}
        onClick={rejectInvitationHandler}
      >
        <ClearIcon />
      </IconButton>
    </div>
  );
};

export default InvitationDecisionButtons;
