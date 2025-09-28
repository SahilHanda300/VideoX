import React, { useEffect, useState } from "react";
import { validateMail } from "../../shared/utilities/validators";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Typography,
} from "@mui/material";
import InputComp from "../../shared/components/InputComp";
import CustomButton from "../../shared/components/CustomButton";
import { connect } from "react-redux";
import { getActions } from "../../actions/friendsActions";

const AddFriendDialog = ({
  isDialogOpen,
  closeDialogHandler,
  sendFriendInvitation = () => {},
}) => {
  const [mail, setMail] = useState("");
  const [formValid, setIsFormValid] = useState(false);

  const handleSendInvitation = () => {
    sendFriendInvitation({ targetMailAddress: mail }, handleCloseDialog);
    setMail("");
  };

  const handleCloseDialog = () => {
    closeDialogHandler();
    setMail("");
  };

  useEffect(() => {
    setIsFormValid(validateMail(mail));
  }, [mail]);

  const handleKeyPress = (event) => {
    if (event.key === "Enter" && formValid && !event.shiftKey) {
      event.preventDefault();
      handleSendInvitation();
    }
  };

  return (
    <Dialog open={isDialogOpen} onClose={handleCloseDialog}>
      <DialogTitle>Invite a Friend</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Enter your friend's email address to send them an invitation.
        </DialogContentText>
        <InputComp
          label="Friend's Email"
          type="email"
          value={mail}
          setValue={setMail}
          onKeyPress={handleKeyPress}
        />
      </DialogContent>
      <DialogActions>
        <CustomButton
          onClick={handleSendInvitation}
          disabled={!formValid}
          label="Send Invitation"
        />
      </DialogActions>
    </Dialog>
  );
};

const mapActions = (dispatch) => {
  return {
    ...getActions(dispatch),
  };
};

export default connect(null, mapActions)(AddFriendDialog);
