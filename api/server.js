require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const messageRouter = require("./messages/message-router");
const composeRouter = require("./Sender/compose-router")


const server = express();

// server.use(cors())
server.use(cors({ credentials: true, origin: ["http://localhost:3000", "https://tagger-lab.netlify.com"] }));


server.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", req.headers.origin);
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Set-Cookie");
  res.header('Access-Control-Allow-Credentials', true)
  next();
});

server.use(helmet());
server.use(express.json());

//ROUTERS
server.use("/emails", messageRouter);
server.use("/compose", composeRouter)


//test default api
server.get("/", (req, res) => {
  res.status(200).json({ api: "up" });
});

module.exports = server;
