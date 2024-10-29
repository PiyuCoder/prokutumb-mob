const express = require("express");
require("dotenv").config();
const path = require("path");
const connectDB = require("./config/db")();

const userRouter = require("./routes/userRoute");
const postRouter = require("./routes/postRoutes");
const otherRouter = require("./routes/otherRoutes");

const app = express();
app.use(express.json());

// Serve static files from the "uploads" directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/user", userRouter);
app.use("/api/posts", postRouter);
app.use("/api", otherRouter);

const PORT = process.env.PORT || "3001";
app.listen(PORT, () => console.log(`Listening on port: ${PORT}`));
