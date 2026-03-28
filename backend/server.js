const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { createAdapter } = require("@socket.io/redis-adapter");
const { pubClient, subClient } = require("./redisClient");
const connectDB = require("./db");
const Message = require("./models/Message");

const app = express();
const server = http.createServer(app);

// DB connect
connectDB();

const io = new Server(server, {
  cors: {
    origin: "*"
  }
});

// Redis adapter
io.adapter(createAdapter(pubClient, subClient));

// Health
app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

io.on("connection", async (socket) => {
  console.log("User connected:", socket.id);

  // Send old messages (limit for low memory)
  const messages = await Message.find().sort({ createdAt: -1 }).limit(20);
  socket.emit("init messages", messages.reverse());

  socket.on("chat message", async (msg) => {
    const newMsg = await Message.create({ text: msg });
    io.emit("chat message", newMsg.text);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
