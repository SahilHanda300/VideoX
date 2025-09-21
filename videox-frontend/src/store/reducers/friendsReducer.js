// Reducer for friends, invitations, and online users
const initialState = {
  friends: [],
  pendingInvitations: [],
  onlineUsers: [],
};

const friendsReducer = (state = initialState, action) => {
  switch (action.type) {
    case "FRIENDS.SET_FRIENDS":
      return {
        ...state,
        friends: action.friends,
      };
    case "FRIENDS.SET_PENDING_FRIEND_INVITATIONS":
      return {
        ...state,
        pendingInvitations: action.pendingFriendInvitations,
      };
    case "FRIENDS.SET_ONLINE_USERS":
      return {
        ...state,
        onlineUsers: action.onlineUsers,
      };
    default:
      return state;
  }
};

export default friendsReducer;
