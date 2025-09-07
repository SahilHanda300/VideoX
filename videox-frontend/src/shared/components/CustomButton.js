import React from 'react'
import { Button } from '@mui/material';
const CustomButton = ({label,disabled,onClick}) => {
  return (
    <>
      <Button
        fullWidth
        sx={{
          mt: 2,
          backgroundColor: "#fb923c",   // lighter orange
          color: "#fff",
          "&:hover": { backgroundColor: "#f97316" }, // darker on hover
        }}
        onClick={onClick}
        disabled={disabled}
      >
        {label}
      </Button>
    </>
  )
}

export default CustomButton
