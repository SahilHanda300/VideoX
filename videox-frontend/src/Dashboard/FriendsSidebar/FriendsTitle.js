import React from 'react'
import { Typography } from '@mui/material'    

const FriendsTitle = ({ title }) => {
  return (
    <Typography
      className="text-white text-center mt-4"
      sx={{
        fontWeight: 'bold',
        fontSize: '1rem',
      }}
    >
      {title}
    </Typography>
  );
};

export default FriendsTitle
