import React from 'react'
import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';
import { IconButton, Tooltip } from '@mui/material';
const InvitationDecisionButtons = ({ acceptInvitationHandler, rejectInvitationHandler, disabled }) => {
  return (
    <div>
        <IconButton style={{color:"orange",paddingLeft:"2rem"}} disabled={disabled} onClick={acceptInvitationHandler}>
          <CheckIcon />
        </IconButton>
        <IconButton style={{color:"orange"}} disabled={disabled} onClick={rejectInvitationHandler}>
          <ClearIcon />
        </IconButton>
    </div>
  )
}

export default InvitationDecisionButtons
