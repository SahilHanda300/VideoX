const jwt = require("jsonwebtoken");
const config = process.env;

const verifyTokenSocket = (socket, next) => {
  const token = socket.handshake.auth?.token;

  if (!token) {
    return next(new Error("Authentication error"));
  }

  jwt.verify(token, config.TOKEN_KEY, (err, decoded) => {
    if (err) {
      return next(new Error("Authentication error"));
    }
    socket.user = decoded;
    socket.userId = decoded.userId;
    socket.user.username = decoded.username;
    next();
  });
};
module.exports = { verifyTokenSocket };
