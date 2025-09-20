import React from 'react'
import {Button} from '@mui/material'
import GroupsIcon from '@mui/icons-material/Groups';
const MainPageButton = () => {
  return (
    <div className='mt-5 ml-2'>
      <Button style={{ color: 'white', backgroundColor: '#FFBF00' }}>
        <GroupsIcon />
      </Button>
    </div>
  )
}

export default MainPageButton
