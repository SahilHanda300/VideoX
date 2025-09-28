import React, { useState } from "react";
import {
  Avatar,
  Typography,
  Box,
  IconButton,
  Menu,
  MenuItem,
  TextField,
} from "@mui/material";
import { MoreVert, Edit, Delete } from "@mui/icons-material";
import { useSelector } from "react-redux";

const Message = ({
  content,
  username,
  date,
  author,
  messageId,
  onEdit,
  onDelete,
  edited,
  editedAt,
}) => {
  const currentUserId = useSelector((state) => state.auth.user?._id);
  const isOwnMessage = author?._id === currentUserId;


  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(content);
  const [anchorEl, setAnchorEl] = useState(null);


  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    setIsEditing(true);
    handleMenuClose();
  };

  const handleSaveEdit = () => {
    if (editContent.trim() && editContent !== content) {
      onEdit(messageId, editContent.trim());
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditContent(content);
    setIsEditing(false);
  };

  const handleDelete = () => {
    onDelete(messageId);
    handleMenuClose();
  };
  return (
    <Box
      display="flex"
      alignItems="flex-start"
      gap={2}
      justifyContent={isOwnMessage ? "flex-end" : "flex-start"}
    >

      {!isOwnMessage && <Avatar>{username?.[0]?.toUpperCase() || "?"}</Avatar>}
      <Box
        sx={{
          bgcolor: isOwnMessage ? "#ffe0b2" : "#fff",
          borderRadius: 2,
          px: 2,
          py: 1,
          maxWidth: 650, // Increased width for both sender and receiver
          minWidth: 120,
          position: "relative",
        }}
        onMouseEnter={(e) => {
          if (isOwnMessage) {
            e.currentTarget.querySelector(".message-menu").style.display =
              "block";
          }
        }}
        onMouseLeave={(e) => {
          if (isOwnMessage) {
            e.currentTarget.querySelector(".message-menu").style.display =
              "none";
          }
        }}
      >
        {isOwnMessage && (
          <IconButton
            className="message-menu"
            size="small"
            onClick={handleMenuOpen}
            sx={{
              position: "absolute",
              top: 4,
              right: 4,
              display: "none",
              bgcolor: "rgba(255,255,255,0.8)",
              "&:hover": { bgcolor: "rgba(255,255,255,1)" },
            }}
          >
            <MoreVert fontSize="small" />
          </IconButton>
        )}

        <Typography
          variant="subtitle2"
          fontWeight="bold"
          align={isOwnMessage ? "right" : "left"}
        >
          {username}
        </Typography>
        <Typography
          variant="body2"
          color="textSecondary"
          align={isOwnMessage ? "right" : "left"}
        >
          {new Date(date).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Typography>

        {isEditing ? (
          <Box sx={{ mt: 1 }}>
            <TextField
              fullWidth
              multiline
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSaveEdit();
                } else if (e.key === "Escape") {
                  handleCancelEdit();
                }
              }}
              autoFocus
              size="small"
            />
            <Box
              sx={{
                mt: 1,
                display: "flex",
                gap: 1,
                justifyContent: "flex-end",
              }}
            >
              <button
                onClick={handleCancelEdit}
                style={{
                  background: "none",
                  border: "1px solid #ccc",
                  borderRadius: 4,
                  padding: "4px 8px",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                style={{
                  background: "#ff6b35",
                  color: "white",
                  border: "none",
                  borderRadius: 4,
                  padding: "4px 8px",
                  cursor: "pointer",
                }}
              >
                Save
              </button>
            </Box>
          </Box>
        ) : (
          <Box>
            <Typography variant="body1" align={isOwnMessage ? "right" : "left"}>
              {content}
            </Typography>
            {edited && (
              <Typography
                variant="caption"
                color="textSecondary"
                align={isOwnMessage ? "right" : "left"}
                sx={{ fontStyle: "italic", fontSize: "0.75rem" }}
              >
                (edited
                {editedAt
                  ? ` ${new Date(editedAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}`
                  : ""}
                )
              </Typography>
            )}
          </Box>
        )}

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleEdit}>
            <Edit fontSize="small" sx={{ mr: 1 }} />
            Edit
          </MenuItem>
          <MenuItem onClick={handleDelete} sx={{ color: "error.main" }}>
            <Delete fontSize="small" sx={{ mr: 1 }} />
            Delete
          </MenuItem>
        </Menu>
      </Box>
      {isOwnMessage && <Avatar>{username?.[0]?.toUpperCase() || "?"}</Avatar>}
    </Box>
  );
};

export default Message;
