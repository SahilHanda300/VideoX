import * as React from "react";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { IconButton, ListItemIcon } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { Logout } from "@mui/icons-material";
import { logout } from "../../shared/utilities/auth";

export default function Dropdown() {
  // State for menu anchor
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  // Open menu on icon click
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  // Close menu
  const handleClose = () => {
    setAnchorEl(null);
  };

  // Render dropdown menu with logout option
  return (
    <div>
      <IconButton onClick={handleClick}>
        <MoreVertIcon />
      </IconButton>

      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        slotProps={{
          list: {
            "aria-labelledby": "basic-button",
          },
        }}
      >
        {/* Logout menu item */}
        <MenuItem
          onClick={() => {
            handleClose();
            logout();
          }}
        >
          <ListItemIcon>
            <Logout fontSize="small" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>
    </div>
  );
}
