import { React, useState } from "react";
import { Avatar, Button, Tooltip } from "@mui/material";
import InvitationDecisionButtons from "./InvitationDecisionButtons";
import { connect } from "react-redux";
import { getActions } from "../../../actions/friendsActions";

// Renders a single pending friend invitation with accept/reject actions
const PendingInvitationListItem = ({
  id,
  username,
  mail,
  acceptFriendInvitation = () => {},
  rejectFriendInvitation = () => {},
}) => {
  // State for button and action status
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const [actionInProgress, setActionInProgress] = useState(false);

  // Handle accept invitation
  const handleAcceptInvitation = async () => {
    if (buttonDisabled || actionInProgress) return;
    setActionInProgress(true);
    await acceptFriendInvitation({ id });
    setButtonDisabled(true);
    setActionInProgress(false);
  };

  // Handle reject invitation
  const handleRejectInvitation = async () => {
    if (buttonDisabled || actionInProgress) return;
    setActionInProgress(true);
    await rejectFriendInvitation({ id });
    setButtonDisabled(true);
    setActionInProgress(false);
  };

  // Render invitation item with accept/reject buttons
  return (
    <Tooltip title={mail} arrow>
      <Button
        className="w-full flex mt-10 items-center justify-center relative"
        style={{ color: "black", backgroundColor: "white" }}
        disabled={buttonDisabled}
      >
        <Avatar>{username?.[0]?.toUpperCase() || "?"}</Avatar>
        <span className="ml-2">{username}</span>
        <InvitationDecisionButtons
          acceptInvitationHandler={handleAcceptInvitation}
          rejectInvitationHandler={handleRejectInvitation}
          disabled={buttonDisabled}
        />
      </Button>
    </Tooltip>
  );
};

const mapActionsToProps = (dispatch) => {
  return {
    ...getActions(dispatch),
  };
};

export default connect(null, mapActionsToProps)(PendingInvitationListItem);
