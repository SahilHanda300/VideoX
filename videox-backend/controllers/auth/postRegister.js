// Handles user registration requests
const User = require("../../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken"); 

const postRegister = async (req, res) => {
  try {
    // Extract username, email, and password from request body
    const { username, mail, password } = req.body;

    // Check if user already exists by email
    const userExists = await User.exists({ mail });

    if (userExists) {
      // Email already registered
      return res.status(409).send("Mail ID already in use.");
    }
    // Encrypt password before saving
    const encryptPassword = await bcrypt.hash(password, 10);

    // Create new user in database
    const user = await User.create({
      username,
      mail: mail.toLowerCase(),
      password: encryptPassword,
    });

    // Create JWT token for new user
    const token = jwt.sign(
      {
        userId: user._id,
        mail,
        username: user.username,
      },
      process.env.TOKEN_KEY,
      {
        expiresIn: "24h",
      }
    );
    // Respond with user details and token
    res.status(201).json({
      userDetails: {
        mail: user.mail,
        username: user.username,
        token: token,
        _id: user._id,
      },
    });
  } catch (error) {
    // Internal server error
    return res.status(500).send("Error occured. Please try again.");
  }
};

module.exports = postRegister; // Export registration handler
