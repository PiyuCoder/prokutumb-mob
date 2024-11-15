const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();
const path = require("path");
const connectDB = require("./config/db")();

const socketHandler = require("./config/socket");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(express.json());

const userSocketMap = {};

const userRouter = require("./routes/userRoute")(io, userSocketMap);
const postRouter = require("./routes/postRoutes");
const otherRouter = require("./routes/otherRoutes");

// Serve static files from the "uploads" directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.static("public"));

app.use("/api/user", userRouter);
app.use("/api/posts", postRouter);
app.use("/api", otherRouter);

socketHandler(io, userSocketMap);

const PORT = process.env.PORT || "3001";
server.listen(PORT, () => console.log(`Listening on port: ${PORT}`));
