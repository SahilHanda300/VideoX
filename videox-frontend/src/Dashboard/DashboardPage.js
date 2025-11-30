import React, { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import SideBar from "./Sidebar/Sidebar";
import FriendsSidebar from "./FriendsSidebar/FriendsSidebar";
import Messenger from "./Messenger/Messenger";
import AppBar from "./AppBar/AppBar";
import { logout } from "../shared/utilities/auth";
import { connect } from "react-redux";
import { getActions } from "../actions/authActions";
import { connectWithSocketServer } from "../realTimeCommunication/socketConnection";
import Room from "./Room/Room";
const DashboardPage = ({ setUserDetails, isUserInRoom }) => {
  const [showSidebars, setShowSidebars] = useState(false);
  const [lastRoomId, setLastRoomId] = useState(null);
  const roomDetails = useSelector((state) => state.room.roomDetails);
  const chosenChatDetails = useSelector(
    (state) => state.chat.chosenChatDetails
  );

  const handleOutsideClick = useCallback(
    (e) => {
      if (window.innerWidth < 768 && showSidebars) {
        const sidebarEl = document.querySelector(".sidebar-container");
        if (sidebarEl && !sidebarEl.contains(e.target)) {
          setShowSidebars(false);
        }
      }
    },
    [showSidebars]
  );

  const toggleSidebars = () => {
    setShowSidebars((prev) => !prev);
  };

  useEffect(() => {
    const userDetails = localStorage.getItem("user");
    if (!userDetails) {
      logout();
    } else {
      setUserDetails(JSON.parse(userDetails));
      connectWithSocketServer(JSON.parse(userDetails));
    }
  }, [setUserDetails]);

  useEffect(() => {
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [showSidebars, handleOutsideClick]);

  useEffect(() => {
    if (window.innerWidth < 768 && showSidebars) {
      setShowSidebars(false);
    }
  }, [chosenChatDetails, isUserInRoom]);

  useEffect(() => {
    if (
      !isUserInRoom &&
      roomDetails &&
      (roomDetails.roomId || roomDetails._id)
    ) {
    }
    if (isUserInRoom) {
    }
  }, [isUserInRoom, roomDetails]);
  // Rejoin flow removed: no special handling when user is not in room

  return (
    <div className="w-full h-screen flex flex-col">
      <AppBar onToggleSidebars={toggleSidebars} />
      <div className="flex flex-1 overflow-hidden relative h-full">
        {/* Backdrop overlay for mobile sidebar */}
        {showSidebars && window.innerWidth < 768 && (
          <div
            className="fixed inset-0 bg-black bg-opacity-40 z-10 md:hidden"
            onClick={() => setShowSidebars(false)}
          />
        )}
        <div
          className={`
            sidebar-container fixed md:static z-20 bg-white md:bg-transparent h-full flex transition-all duration-300
            w-[350px] md:w-auto top-0
            ${showSidebars ? "left-0" : "-left-full"} md:left-0
          `}
          style={{
            boxShadow: showSidebars ? "2px 0 8px rgba(0,0,0,0.15)" : "none",
          }}
        >
          <SideBar />
          <FriendsSidebar />
        </div>

        <Messenger />
      </div>

      {isUserInRoom && (
        <Room
          onLeaveRoom={() => {
            // Rejoin removed — simply leave the room without storing last room id
          }}
        />
      )}
    </div>
  );
};

const mapStoreStateToProps = ({ room }) => {
  return {
    ...room,
  };
};

const mapActions = (dispatch) => {
  return {
    ...getActions(dispatch),
  };
};
export default connect(mapStoreStateToProps, mapActions)(DashboardPage);
