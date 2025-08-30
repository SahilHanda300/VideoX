const express = require("express");
const http = require("http");
const cors = require("cors");
const mongoose = require("mongoose");

require("dotenv").config();



const PORT = process.env.PORT || process.env.API_PORT;

const app = express();
app.use(express.json());
app.use(cors());

const routes = require('./routes/routes')

app.use('/api/auth',routes)


const server = http.createServer(app);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    server.listen(PORT, () => {
      console.log("Server is listening on", PORT);
    });
  })
  .catch((err) => {
    console.log("Database connection not started", err);
  });
