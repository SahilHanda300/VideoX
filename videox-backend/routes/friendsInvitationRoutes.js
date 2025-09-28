
const express = require("express");
const router = express.Router();
const validator = require("express-joi-validation").createValidator({});
const joi = require("joi");

const auth = require("../middleware/auth");
const friendsInvitationControllers = require("../controllers/friendsInvitation/friendsInvitationController");


const postFriendInvitationSchema = joi.object({
  targetMailAddress: joi.string().email().required(),
});

const inviteDecisionSchema = joi.object({
  id: joi.string().required(),
});


router.post(
  "/invite",
  auth,
  validator.body(postFriendInvitationSchema),
  friendsInvitationControllers.controllers.postInvite
);


router.post(
  "/accept",
  auth,
  validator.body(inviteDecisionSchema),
  friendsInvitationControllers.controllers.postAccept
);

router.post(
  "/reject",
  auth,
  validator.body(inviteDecisionSchema),
  friendsInvitationControllers.controllers.postReject
);

module.exports = router;
