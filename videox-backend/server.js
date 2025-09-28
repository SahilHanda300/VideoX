require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const mongoose = require("mongoose");

const authRoutes = require("./routes/routes");
const friendsInvitationRoutes = require("./routes/friendsInvitationRoutes");
const { registerSocketServer } = require("./socketServer");

const app = express();
const PORT = process.env.PORT || 5002;

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/friends", friendsInvitationRoutes);

const server = http.createServer(app);

registerSocketServer(server);


mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    server.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
  })
  .catch((err) => console.log("DB connection failed:", err));
