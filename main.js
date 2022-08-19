const express = require("express");
const cors = require("cors");
const { createServer } = require("http");
const { ExpressPeerServer } = require("peer");
const { Server } = require("socket.io");
// import { connectDB } from './app/helpers';

const app = express();
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

  socket.on("join-room", (roomId, peerId, usertype) => {
    console.log(" roomId: ", roomId, " peerId: ", peerId, usertype);
    socket.join(roomId);
    socket.to(roomId).emit("user-connected", peerId, usertype);
    console.log("socket room: ");
    socket.on("disconnect", () => {
      socket.to(roomId).emit("user-disconnected", peerId);
    });
  });
});

module.exports.io = io;
