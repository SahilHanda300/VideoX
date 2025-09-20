import React, { useEffect, useState } from 'react';
import SideBar from './Sidebar/Sidebar';
import FriendsSidebar from './FriendsSidebar/FriendsSidebar';
import Messenger from './Messenger/Messenger';
import AppBar from './AppBar/AppBar';
import { logout } from '../shared/utilities/auth';
import {connect} from 'react-redux';
import { getActions } from '../actions/authActions';
const DashboardPage = ({setUserDetails}) => {


  const [showSidebars, setShowSidebars] = useState(false);

  const toggleSidebars = () => {
    setShowSidebars((prev) => !prev);
  };

  useEffect(()=>{
    const userDetails = localStorage.getItem("user");
    if(!userDetails){
      logout();
    } else {
      setUserDetails(JSON.parse(userDetails));
    }
  },[]);

  return (
    <div className="w-full h-screen flex flex-col">
      <AppBar onToggleSidebars={toggleSidebars} />
      <div className="flex flex-1 overflow-hidden relative">
        <div
          className={`
            absolute md:static z-20 bg-white md:bg-transparent h-full flex transition-all duration-300
            ${showSidebars ? 'left-0' : '-left-full'} md:left-0
          `}
        >
          <SideBar />
          <FriendsSidebar />
        </div>


        <Messenger />
      </div>
    </div>
  );
};

const mapActions = (dispatch) => {
  return {
    ...getActions(dispatch),
  };
}
export default connect(null, mapActions)(DashboardPage);
