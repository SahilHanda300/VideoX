import React from "react";
import { Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import * as roomHandler from "../../realTimeCommunication/roomHandler";
const CreateRoomButton = () => {
  const createNewRoomHandler = () => {
    roomHandler.createNewRoom();
  };
  return (
    <div className="mt-5 ml-2">
      <Button style={{ color: "white", backgroundColor: "#FFBF00" }} onClick={createNewRoomHandler}>
        <AddIcon />
      </Button>
    </div>
  );
};

export default CreateRoomButton;
