import store from "../../store/store";
import { setMessages } from "../../actions/chatActions";
export const updateDirectChatHistoryIfActive = (data) => {
  const { participants, messages } = data;
  const recieverId = store.getState().chat.chosenChatDetails?._id;
  const userId = store.getState().auth.user?._id;

  if (recieverId && userId) {
    const usersInConversation = [recieverId, userId];
    updateChatHistoryIfSameConversationIsActive(
      participants,
      messages,
      usersInConversation
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

  if (result) {
    store.dispatch(setMessages(messages));
  }
};
