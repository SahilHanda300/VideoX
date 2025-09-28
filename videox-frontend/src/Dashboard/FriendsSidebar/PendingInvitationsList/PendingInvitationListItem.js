import { React, useState } from "react";
import { Avatar, Button, Tooltip } from "@mui/material";
import InvitationDecisionButtons from "./InvitationDecisionButtons";
import { connect } from "react-redux";
import { getActions } from "../../../actions/friendsActions";

const PendingInvitationListItem = ({
  id,
  username,
  mail,
  acceptFriendInvitation = () => {},
  rejectFriendInvitation = () => {},
}) => {
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const [actionInProgress, setActionInProgress] = useState(false);

  const handleAcceptInvitation = async () => {
    if (buttonDisabled || actionInProgress) return;
    setActionInProgress(true);
    await acceptFriendInvitation({ id });
    setButtonDisabled(true);
    setActionInProgress(false);
  };

  const handleRejectInvitation = async () => {
    if (buttonDisabled || actionInProgress) return;
    setActionInProgress(true);
    await rejectFriendInvitation({ id });
    setButtonDisabled(true);
    setActionInProgress(false);
  };

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
