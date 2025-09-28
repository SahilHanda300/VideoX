import { React } from "react";
import { useSelector } from "react-redux";
import Dropdown from "./Dropdown";
import ChosenOptionLabel from "./ChosenOptionLabel";

const AppBar = ({ onToggleSidebars }) => {
  
  const chosenChatDetails = useSelector(
    (state) => state.chat.chosenChatDetails
  );

  const dashboardClass =
    chosenChatDetails &&
    typeof window !== "undefined" &&
    window.innerWidth < 640
      ? "hidden"
      : "block";

  return (
    <div className="w-full h-[60px] bg-orange-400 text-white flex items-center px-4 justify-between">
      <button
        className="md:hidden text-white text-2xl"
        onClick={onToggleSidebars}
      >
        ☰
      </button>
      <h1
        className={`font-bold text-lg mx-auto md:mx-0 ${dashboardClass} sm:block`}
      >
        Dashboard
      </h1>
      <ChosenOptionLabel />
      <Dropdown />
    </div>
  );
};

export default AppBar;
