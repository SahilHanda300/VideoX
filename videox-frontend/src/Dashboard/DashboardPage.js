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
  const [canRejoinRoom, setCanRejoinRoom] = useState(false);
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
  }, [chosenChatDetails, isUserInRoom, showSidebars]);

  useEffect(() => {
    if (
      !isUserInRoom &&
      roomDetails &&
      (roomDetails.roomId || roomDetails._id)
    ) {
      setLastRoomId(roomDetails.roomId || roomDetails._id);
      setCanRejoinRoom(true);
    }
    if (isUserInRoom) {
      setCanRejoinRoom(false);
    }
  }, [isUserInRoom, roomDetails]);

  return (
    <div className="w-full h-screen flex flex-col">
      <AppBar onToggleSidebars={toggleSidebars} />
      <div className="flex flex-1 overflow-hidden relative h-full">
        <div
          className={`
            sidebar-container absolute md:static z-20 bg-white md:bg-transparent h-full flex transition-all duration-300
            ${showSidebars ? "left-0" : "-left-full"} md:left-0
          `}
        >
          <SideBar />
          <FriendsSidebar />
        </div>

        <Messenger />
      </div>

      {isUserInRoom && (
        <Room
          onLeaveRoom={() => {
            // Store last room ID before leaving
            if (roomDetails && (roomDetails.roomId || roomDetails._id)) {
              setLastRoomId(roomDetails.roomId || roomDetails._id);
              setCanRejoinRoom(true);
            }
          }}
        />
      )}
      {!isUserInRoom && canRejoinRoom && lastRoomId && (
        <div
          style={{
            position: "fixed",
            bottom: 32,
            right: 32,
            zIndex: 2000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <button
            className="bg-orange-500 text-white px-6 py-3 rounded-full shadow-lg hover:bg-orange-600 transition text-lg font-semibold"
            style={{ minWidth: 160 }}
            onClick={() => {
              setCanRejoinRoom(false);
              import("../realTimeCommunication/roomHandler").then((mod) => {
                mod.joinRoom(lastRoomId);
              });
            }}
          >
            Re-join Room
          </button>
        </div>
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
