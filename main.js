const express = require("express");
const cors = require("cors");
const { createServer } = require("http");
const { ExpressPeerServer } = require("peer");
const { Server } = require("socket.io");
// import { connectDB } from './app/helpers';

const app = express();

var corsOptions = {
  origin: ["http://localhost:4200", "https://easymeeting.vercel.app"],
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};

app.use(cors());
const httpServer = createServer(app);

httpServer.listen(process.env.PORT || 9000, () => {
  console.log("peer server running");
});

const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:4200", "https://easymeeting.vercel.app"],
    credentials: true,
  },
});

const peerServer = ExpressPeerServer(httpServer, {
  path: "/",
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/", peerServer);

// Connect to db
// async () => await connectDB();

// import routes
// app.use('/', router);

// server.listen(9000,()=>{
//     console.log('peer server running');
// });

peerServer.on("connection", (peer) => {
  console.log("peer data: ", peer.getId());
});
peerServer.on("disconnection", (peer) => {
  console.log("peer disconnected: ", peer);
});

io.on("connection", (socket) => {
  console.log("con: ", socket.id);
  socket.on("hello", (message) => {
    console.log("hello message: ", message);
    socket.emit("hello", "I have received your message");
  });
  socket.on("ask-to-join", (roomId, username, socketId) => {
    console.log("asking to join: ", roomId, username, socketId);
    socket.join(roomId);
    socket.to(roomId).emit("ask-to-join", roomId, username, socketId);
  });
  socket.on("admit-or-reject", (socketId, result) => {
    console.log("admit or reject: ", result);
    socket.to(socketId).emit("admitted", result);
  });
  socket.on("join-room", (roomId, peerId, username, socketId) => {
    console.log(" roomId: ", roomId, " peerId: ", peerId, username);
    socket.join(roomId);
    socket.to(roomId).emit("user-connected", peerId, username, socketId);
    console.log("socket room: ");
    socket.on("disconnect", () => {
      socket.to(roomId).emit("user-disconnected", peerId);
    });
    socket.on("turn-off-cam", (peerId, socketId) => {
      console.log(
        "asking user with ",
        peerId,
        " as peerId and ",
        socketId,
        " as socketId to turn of cam"
      );
      socket.to(socketId).emit("turn-off-cam", peerId, socketId);
    });
    socket.on("turn-on-cam", (peerId, socketId) => {
      console.log(
        "asking user with ",
        peerId,
        " as peerId and ",
        socketId,
        " as socketId to turn on cam"
      );
      socket.to(socketId).emit("turn-on-cam", peerId, socketId);
    });
    socket.on("turn-off-mic", (peerId, socketId) => {
      console.log(
        "asking user with ",
        peerId,
        " as peerId and ",
        socketId,
        " as socketId to turn of mic"
      );
      socket.to(socketId).emit("turn-off-mic", peerId, socketId);
    });
    socket.on("turn-off-cam", (peerId, socketId) => {
      console.log(
        "asking user with ",
        peerId,
        " as peerId and ",
        socketId,
        " as socketId to turn on mic"
      );
      socket.to(socketId).emit("turn-on-mic", peerId, socketId);
    });
    socket.on("request-details", (peerId) => {
      socket.to(roomId).emit("request-details", peerId);
    });
    socket.on("sent-details", (peerId, socketId, username) => {
      socket.to(roomId).emit("sent-details", peerId, socketId, username);
    });
  });
});

module.exports.io = io;
