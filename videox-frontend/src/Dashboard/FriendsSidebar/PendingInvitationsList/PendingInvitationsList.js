import React from "react";
import PendingInvitationListItem from "./PendingInvitationListItem";
import { connect } from "react-redux";

const PendingInvitationsList = ({ pendingFriendInvitations }) => {
  return (
    <div className="w-full flex flex-col items-center gap-2">
      {pendingFriendInvitations?.length > 0 ? (
        pendingFriendInvitations.map((invitation) => {
          const sender = invitation.senderId || {};
          return (
            <PendingInvitationListItem
              key={invitation._id}
              id={invitation._id}
              username={sender.username || "Unknown"}
              mail={sender.mail || "Unknown"}
            />
          );
        })
      ) : (
        <p>No pending invitations</p>
      )}
    </div>
  );
};

const mapStoreToProps = ({ friends }) => ({
  pendingFriendInvitations: friends.pendingFriendInvitations,
});

export default connect(mapStoreToProps)(PendingInvitationsList);
