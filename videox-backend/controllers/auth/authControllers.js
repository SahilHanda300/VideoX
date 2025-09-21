const postLogin = require("./postLogin");
const postRegister = require("./postRegister"); // Handles user registration

exports.controllers = {
  postLogin,
  postRegister,
};

// Aggregates authentication controller functions for VideoX backend


// Export controllers for use in routes
exports.controllers = {
  postLogin,
  postRegister,
};
