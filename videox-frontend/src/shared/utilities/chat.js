import store from "../../store/store";
import { setMessages } from "../../actions/chatActions";
export const updateDirectChatHistoryIfActive = (data) => {
  const { participants, messages } = data;
  const recieverId = store.getState().chat.chosenChatDetails?._id;
  const userId = store.getState().auth.user?._id;

  console.log("[updateDirectChatHistoryIfActive] called with:", {
    participants,
    messages,
  });
  console.log(
    "[updateDirectChatHistoryIfActive] chosenChatDetails:",
    recieverId,
    "userId:",
    userId
  );

  if (recieverId && userId) {
    const usersInConversation = [recieverId, userId];
    console.log(
      "[updateDirectChatHistoryIfActive] usersInConversation:",
      usersInConversation
    );
    updateChatHistoryIfSameConversationIsActive(
      participants,
      messages,
      usersInConversation
    );
  } else {
    console.log(
      "[updateDirectChatHistoryIfActive] recieverId or userId missing"
    );
  }
};

export const updateChatHistoryIfSameConversationIsActive = (
  participants,
  messages,
  usersInConversation
) => {
  const result = participants.every(function (participant) {
    return usersInConversation.includes(participant);
  });

  console.log(
    "[updateChatHistoryIfSameConversationIsActive] participants:",
    participants,
    "usersInConversation:",
    usersInConversation,
    "result:",
    result
  );

  if (result) {
    console.log(
      "[updateChatHistoryIfSameConversationIsActive] Dispatching setMessages with:",
      messages
    );
    store.dispatch(setMessages(messages));
  } else {
    console.log(
      "[updateChatHistoryIfSameConversationIsActive] Not active conversation, not updating messages."
    );
  }
};
