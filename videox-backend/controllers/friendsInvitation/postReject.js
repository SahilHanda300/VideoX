const FriendsInvitation = require("../../models/friends");
const { updateFriendsPendingInvitations } = require('../../socketHandlers/updates/friends');
const postReject = async (req, res) => {
    try {
        const {id} = req.body;
        const {userId} = req.user;

        const invitationExists = await FriendsInvitation.exists({_id:id});
        if(invitationExists){
           await FriendsInvitation.deleteOne({_id:id});
        }
        updateFriendsPendingInvitations(userId);
        return res.status(200).send("Invitation Rejected");
    } catch (error) {
        return res.status(500).send("Internal Server Error");
    }
}

module.exports = postReject;
