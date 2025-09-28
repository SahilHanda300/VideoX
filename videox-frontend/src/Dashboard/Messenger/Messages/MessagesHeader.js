import React from "react";
import { Avatar } from "@mui/material";
const MessagesHeader = ({ name }) => {
  const displayName = name && name.trim() ? name : "User";
  return (
    <div className="w-full p-4 border-b flex items-center gap-4 mt-6 md:mt-4">
      <Avatar>{displayName[0]}</Avatar>
      <div className="flex-1 min-w-0">
        <div
          className="font-bold text-lg md:text-xl lg:text-2xl truncate"
          title={displayName}
        >
          {displayName}
        </div>
        <div className="text-sm text-gray-500 truncate">
          This is the beginning of your conversation with {displayName}
        </div>
      </div>
    </div>
  );
};

export default MessagesHeader;
