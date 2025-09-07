import React from "react";
import { TextField } from "@mui/material";

const InputComp = ({ label, value, setValue, type, placeholder }) => {
  return (
    <TextField
      label={label}
      variant="outlined"
      fullWidth
      margin="normal"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      type={type}
      placeholder={placeholder}
      sx={{
        "& .MuiOutlinedInput-root": {
          backgroundColor: "transparent",
          "& fieldset": { borderColor: "#fb923c" },
          "&:hover fieldset": { borderColor: "#fb923c" },
          "&.Mui-focused fieldset": { borderColor: "#fb923c" },
        },
        "& .MuiInputLabel-root": { color: "#f97316" },
        "& .MuiInputLabel-root.Mui-focused": { color: "#f97316" }, // add this
      }}
    />
  );
};

export default InputComp;
