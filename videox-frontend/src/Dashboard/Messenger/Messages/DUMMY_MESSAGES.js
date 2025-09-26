// Dummy messages for Messenger UI
const DUMMY_MESSAGES = [
  {
    _id: 1,
    senderId: 2,
    content: "Hello! How are you?",
    author: {
      username: "Sahil",
    },
    date: new Date().toISOString(),
    sameAuthor: true,
    sameDay: true,
  },
  {
    _id: 2,
    senderId: 1,
    content: "I'm good, thanks! How about you?",
    author: {
      username: "Handa",
    },
    date: new Date().toISOString(),
    sameAuthor: false,
    sameDay: true,
  },
];

export default DUMMY_MESSAGES;
