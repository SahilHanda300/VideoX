import React from "react";
import FriendsListItem from "./FriendsListItem";
const FriendsList = () => {
  const dummy = [
    {
      id: 1,
      name: "Mark",
      isOnline: true,
    },
    {
      id: 2,
      name: "John",
      isOnline: false,
    },
    
  ];
  return (
    <div className="flex flex-col gap-2">
      {dummy.map((friend) => (
        <FriendsListItem key={friend.id} name={friend.name} isOnline={friend.isOnline} />
      ))}
    </div>
  );
};

export default FriendsList;
