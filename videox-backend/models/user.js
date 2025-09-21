const mongoose = require("mongoose");
const Schema = mongoose.Schema;
// Define user schema fields
const userSchema = new mongoose.Schema({
  mail: { type: String, unique: true }, // User email (unique)
  username: { type: String }, // Username
  password: { type: String }, // Hashed password
  friends: [{ type: Schema.Types.ObjectId, ref: "User" }], // List of friends (references to User)
});

// Export User model
module.exports = mongoose.model("User", userSchema);
// User model for authentication and friends
