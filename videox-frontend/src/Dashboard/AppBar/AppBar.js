import {React,useEffect} from 'react';
import Dropdown from './Dropdown';
const AppBar = ({ onToggleSidebars }) => {


  return (
    <div className="w-full h-[60px] bg-orange-400 text-white flex items-center px-4 justify-between">
      <button
        className="md:hidden text-white text-2xl"
        onClick={onToggleSidebars}
      >
        ☰
      </button>
      <h1 className="font-bold text-lg mx-auto md:mx-0">Dashboard</h1>
      <Dropdown />
    </div>
  );
};

export default AppBar;
