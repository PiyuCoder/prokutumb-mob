const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();
const path = require("path");
const connectDB = require("./config/db")();

const socketHandler = require("./config/socket");

const app = express();
const server = http.createServer(app);
const io = require("socket.io")(server, {
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

app.get("/auth/callback", async (req, res) => {
  const { code } = req.query;
  console.log(code);
  if (!code) {
    return res.status(400).send("Authorization code missing.");
  }
  const tokenResponse = await fetch(
    "https://www.linkedin.com/oauth/v2/accessToken",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: "https://prokutumb-mob.onrender.com/auth/callback",
        client_id: process.env.LINKEDIN_CLIENT_ID,
        client_secret: "WPL_AP1.ItYT2qO32AOtxQV8.KPUExQ==",
      }),
    }
  );

  const tokenData = await tokenResponse.json();

  if (!tokenResponse.ok) {
    console.error("Token Fetch Error:", tokenData);
    return res.status(tokenResponse.status).json({
      error: tokenData.error || "Unable to fetch access token.",
    });
  }

  console.log("Access Token:", tokenData.access_token);

  res.redirect(`prokutumb://auth/callback?token=${tokenData.access_token}`);
});

app.use("/api/user", userRouter);
app.use("/api/posts", postRouter);
app.use("/api", otherRouter);

socketHandler(io, userSocketMap);

const PORT = process.env.PORT || "3001";
server.listen(PORT, () => console.log(`Listening on port: ${PORT}`));
