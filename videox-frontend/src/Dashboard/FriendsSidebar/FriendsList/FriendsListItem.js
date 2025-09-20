import React from 'react'
import { Button,Avatar } from '@mui/material';
import OnlineIndicator from './OnlineIndicator';
const FriendsListItem = ({ key, name, isOnline }) => {
  return (
    <Button className='w-full flex mt-10 items-center justify-center relative' style={{color:'black', backgroundColor:'white' }}>
        <Avatar/>
        <span className='ml-2'>{name}</span>
        {isOnline && <OnlineIndicator />}
    </Button>
  )
}

export default FriendsListItem
