import React from "react";
import PendingInvitationListItem from "./PendingInvitationListItem";
const PendingInvitationsList = () => {
  const dummy = [
    {
      _id: 1,
      senderDetails: {
        username : 'John',
        mail: 'john@example.com'
      }
    },
    {
      _id: 2,
      senderDetails: {
        username : 'Mark',
        mail: 'mark@example.com'
      }
    },
  ];
  return (
    <div className="w-full flex flex-col items-center gap-2">
      {dummy.map((invitation) => (
        <PendingInvitationListItem key={invitation._id} id={invitation._id} username={invitation.senderDetails.username} mail={invitation.senderDetails.mail} />
      ))}
    </div>
  );
};

export default PendingInvitationsList;
