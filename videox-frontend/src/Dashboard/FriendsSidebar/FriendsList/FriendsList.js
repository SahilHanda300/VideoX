import React from "react";
import FriendsListItem from "./FriendsListItem";
import { connect } from "react-redux";

const FriendsList = ({ friends, onlineUsers }) => {

  return (
    <div className="flex flex-col gap-2">
      {friends.map((friend) => (
        <FriendsListItem
          key={friend._id || friend.id}
          id={friend._id || friend.id}
          username={friend.username}
          isOnline={onlineUsers.includes(friend._id || friend.id)}
        />
      ))}
    </div>
  );
};

const mapStateToProps = ({ friends }) => ({
  friends: friends.friends,
  onlineUsers: friends.onlineUsers,
});

export default connect(mapStateToProps)(FriendsList);
