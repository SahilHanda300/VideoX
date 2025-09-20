import { React, useState } from "react";
import { Avatar, Button, Tooltip } from "@mui/material";
import InvitationDecisionButtons from "./InvitationDecisionButtons";
const PendingInvitationListItem = ({
  key,
  id,
  username,
  mail,
  acceptFriendInvitation = () => {},
  rejectFriendInvitation = () => {},
}) => {
  const [buttonDisabled, setButtonDisabled] = useState(false);

  const handleAcceptInvitation = () => {
    acceptFriendInvitation({ id });
    setButtonDisabled(true);
  };

  const handleRejectInvitation = () => {
    rejectFriendInvitation({ id });
    setButtonDisabled(true);
  };

  return (
    <Tooltip title={mail} arrow>
      <Button
        className="w-full flex mt-10 items-center justify-center relative"
        style={{ color: "black", backgroundColor: "white" }}
        disabled={buttonDisabled}
        onClick={handleAcceptInvitation}
      >
        <Avatar />
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

export default PendingInvitationListItem;
