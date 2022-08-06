const express = require("express");

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
    origin: "*",
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

app.get("/message", (req, res) => {
  res.json({ message: "Peer Server is working" });
});

peerServer.on("connection", (data) => {
  console.log("peer data: ", data.id);
});
peerServer.on("disconnection", (data) => {
  console.log("peer disconnected: ", data);
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
  });
});
module.exports.io = io;
