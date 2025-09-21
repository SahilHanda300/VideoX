// friendsActions.js
import { openAlertMessage } from "./alertActions";
import * as api from "../api";

export const friendsActions = {
  SET_FRIENDS: "FRIENDS.SET_FRIENDS",
  SET_PENDING_FRIEND_INVITATIONS: "FRIENDS.SET_PENDING_FRIEND_INVITATIONS",
  SET_ONLINE_USERS: "FRIENDS.SET_ONLINE_USERS",
};

export const getActions = (dispatch) => ({
  sendFriendInvitation: (data, closeDialogHandler) =>
    dispatch(sendFriendInvitation(data, closeDialogHandler)),
  acceptFriendInvitation: (data) => dispatch(acceptFriendInvitation(data)),
  rejectFriendInvitation: (data) => dispatch(rejectFriendInvitation(data)),
});

export const setPendingInvitations = (pendingFriendInvitations) => ({
  type: friendsActions.SET_PENDING_FRIEND_INVITATIONS,
  pendingFriendInvitations,
});

const sendFriendInvitation = (data, closeDialogHandler) => {
  return async (dispatch) => {
    try {
      const response = await api.sendFriendInvitation(data);

      if (!response.error) {
        dispatch(openAlertMessage("Invitation sent successfully"));
        closeDialogHandler();
      } else {
        dispatch(
          openAlertMessage(response.data?.message || "Something went wrong")
        );
      }
    } catch (err) {
      dispatch(
        openAlertMessage(err.response?.data?.message || "Something went wrong")
      );
    }
  };
};

export const setFriends = (friends) => {
  return {
    type: friendsActions.SET_FRIENDS,
    friends,
  };
};
const acceptFriendInvitation = (data) => {
  return async (dispatch) => {
    const response = await api.acceptFriendInvitation(data);
    if (!response) {
      dispatch(openAlertMessage("Invitation accepted successfully"));
    } else {
      dispatch(
        openAlertMessage(response.data?.message || "Something went wrong")
      );
    }
  };
};

const rejectFriendInvitation = (data) => {
  return async (dispatch) => {
    const response = await api.rejectFriendInvitation(data);
    if (!response.error) {
      dispatch(openAlertMessage("Invitation rejected successfully"));
    } else {
      dispatch(
        openAlertMessage(response.data?.message || "Something went wrong")
      );
    }
  };
};
