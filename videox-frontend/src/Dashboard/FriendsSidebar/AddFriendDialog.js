import React, { useEffect, useState } from "react";
import { validateMail } from "../../shared/utilities/validators";
import { Dialog,DialogActions,DialogContent,DialogContentText,DialogTitle,Typography } from "@mui/material";
import InputComp from "../../shared/components/InputComp";
import CustomButton from "../../shared/components/CustomButton";
const AddFriendDialog = ({
  isDialogOpen,
  closeDialogHandler,
  sendFriendInvitation = () => {},
}) => {
  const [mail, setMail] = useState("");
  const [formValid, setIsFormValid] = useState(false);

  const handleSendInvitation = () => {
    // Logic to send friend invitation
  };

  const handleCloseDialog = () => {
    closeDialogHandler();
    setMail("");
  };

  useEffect(() => {
    setIsFormValid(validateMail(mail));
  }, [mail, setIsFormValid]);
  return <div>
    <Dialog open={isDialogOpen} onClose={handleCloseDialog}>
        <DialogTitle><Typography>Invite a Friend</Typography></DialogTitle> 
        <DialogContent>
            <DialogContentText>
                <Typography>Enter your friend's email address to send them an invitation.</Typography>
            </DialogContentText>
            <InputComp
                label="Friend's Email"
                type="email"
                value={mail}
                setValue={setMail}
            />
        </DialogContent>

        <DialogActions>
            <CustomButton onClick={handleSendInvitation} disabled={!formValid} label="Send Invitation" />
        </DialogActions>
    </Dialog>
  </div>;
};

export default AddFriendDialog;
