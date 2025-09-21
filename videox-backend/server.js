// Main backend server setup
require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const mongoose = require("mongoose");

const authRoutes = require("./routes/routes"); // Auth routes
const friendsInvitationRoutes = require("./routes/friendsInvitationRoutes"); // Friends invitation routes
const { registerSocketServer } = require("./socketServer"); // Socket.IO setup

const app = express();
const PORT = process.env.PORT || 5002;

app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON bodies

app.use("/api/auth", authRoutes); // Auth API
app.use("/api/friends", friendsInvitationRoutes); // Friends API

const server = http.createServer(app); // Create HTTP server

registerSocketServer(server); // Setup Socket.IO

// Connect to MongoDB and start server
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    server.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
  })
  .catch((err) => console.log("DB connection failed:", err));
