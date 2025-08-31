const jwt = require("jsonwebtoken");

const config = process.env;

const verifyToken = (req, res, next) => {
  let token = null;
  if (
    req.headers["authorization"] &&
    req.headers["authorization"].startsWith("Bearer ")
  ) {
    token = req.headers["authorization"].slice(7);
  } else if (req.body && req.body.token) {
    token = req.body.token;
  } else if (req.query && req.query.token) {
    token = req.query.token;
  }
  if (!token) {
    return res.status(403).send("A token is required for authentication");
  }

  try {
    token = token.replace(/^Bearer\s+/, "");
    const decodedToken = jwt.verify(token, config.TOKEN_KEY);
    req.user = decodedToken;
  } catch (error) {
    return res.status(401).send("Invalid token");
  }

  return next();
};

module.exports = verifyToken;
