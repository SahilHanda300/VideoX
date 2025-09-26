import React from "react";
import FibreManualRecordIcon from "@mui/icons-material/FiberManualRecord";
// Shows a green dot for online status
const OnlineIndicator = () => {
  return (
    <div className="absolute right-5 flex items-center ">
      <FibreManualRecordIcon color="success" />
    </div>
  );
};

export default OnlineIndicator;
