import {React,useState} from 'react'
import CustomButton from '../../shared/components/CustomButton';
import AddFriendDialog from './AddFriendDialog';
const AddFriendsButton = () => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const handleAddFriendDialog = () => {
        setIsDialogOpen(true);
    }

    const handleCloseDialog = () => {
        setIsDialogOpen(false);
    }

  return (
    <>
      <CustomButton label="Add Friend" onClick={handleAddFriendDialog} />
      <AddFriendDialog
        isDialogOpen={isDialogOpen}
        closeDialogHandler={handleCloseDialog}
      />
    </>
  )
}

export default AddFriendsButton
