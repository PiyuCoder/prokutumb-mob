const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();
const path = require("path");
const connectDB = require("./config/db")();

const userRouter = require("./routes/userRoute");
const postRouter = require("./routes/postRoutes");
const otherRouter = require("./routes/otherRoutes");
const socketHandler = require("./config/socket");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Update with your frontend domain in production
  },
});
app.use(express.json());

// Serve static files from the "uploads" directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/user", userRouter);
app.use("/api/posts", postRouter);
app.use("/api", otherRouter);

socketHandler(io);
const PORT = process.env.PORT || "3001";
app.listen(PORT, () => console.log(`Listening on port: ${PORT}`));
