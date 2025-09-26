import React from "react";
import FriendsListItem from "./FriendsListItem";
import { connect } from "react-redux";
// Renders the list of friends with online status
const FriendsList = ({ friends, onlineUsers }) => {
  console.log("[DEBUG] Friends:", friends);
  console.log("[DEBUG] OnlineUsers:", onlineUsers);
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
  // Get friends and online users from Redux state
  friends: friends.friends,
  onlineUsers: friends.onlineUsers,
});

export default connect(mapStateToProps)(FriendsList);
