import React from 'react';
import AddFriendsButton from './AddFriendsButton';
import FriendsTitle from './FriendsTitle';
import FriendsList from './FriendsList/FriendsList';
import PendingInvitationsList from './PendingInvitationsList/PendingInvitationsList';

const FriendsSidebar = () => {
  return (
    <div className="h-full w-[250px] bg-orange-300 flex flex-col">
      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-2">
        <AddFriendsButton />
        <FriendsTitle title="Private Message" />
        <FriendsList />
      </div>

      {/* Fixed bottom section */}
      <div className="px-2 py-4 border-t border-orange-400 bg-orange-300">
        <FriendsTitle title="Invitations" />
        <PendingInvitationsList />
      </div>
    </div>
  );
};

export default FriendsSidebar;
