const User = require("../../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const postLogin = async (req, res) => {
  try {
    const { mail, password } = req.body;
    const user = await User.findOne({ mail: mail.toLowerCase() });

    if (user && (await bcrypt.compare(password, user.password))) {
      const token = jwt.sign(
        { userId: user._id, mail: user.mail },
        process.env.TOKEN_KEY,
        { expiresIn: "24h" }
      );

      return res.status(200).json({
        userDetails: {
          username: user.username,
          mail: user.mail,
          token,
        },
      });
    }

    return res.status(400).json({ message: "Invalid credentials" });
  } catch (err) {
    return res.status(500).json({ message: "Something went wrong" });
  }
};

module.exports = postLogin;
