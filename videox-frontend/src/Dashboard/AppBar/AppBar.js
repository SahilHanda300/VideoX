import { React } from "react";
import { useSelector } from "react-redux";
import Dropdown from "./Dropdown";
import ChosenOptionLabel from "./ChosenOptionLabel";
// Top navigation bar for dashboard
const AppBar = ({ onToggleSidebars }) => {
  // Get selected chat details from Redux
  const chosenChatDetails = useSelector(
    (state) => state.chat.chosenChatDetails
  );

  // Hide Dashboard text on small screens only when a chat is selected
  const dashboardClass =
    chosenChatDetails &&
    typeof window !== "undefined" &&
    window.innerWidth < 640
      ? "hidden"
      : "block";

  // Render app bar with menu, title, chat label, and dropdown
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
