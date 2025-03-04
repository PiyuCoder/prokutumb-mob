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
const Feed = require("./models/Feed");
const communityRouter = require("./routes/communityRoutes")(io, userSocketMap);

// Serve static files from the "uploads" directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.static("public"));

app.get("/auth/callback", (req, res) => {
  console.log("Callback URL hit:", req.originalUrl);
  res.status(200).send("Callback received!");
});

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
        redirect_uri: "https://prokutumb.com/auth/callback",
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

  // res.redirect(`prokutumb://auth/callback?token=${tokenData.access_token}`);
  res.redirect(`prokutumb://auth/callback?code=${code}`);
});

app.use("/api/user", userRouter);
app.use("/api/posts", postRouter);
app.use("/api", otherRouter);
app.use("/api/communities", communityRouter);
app.get("/posts/:id", async (req, res) => {
  const { id } = req.params;
  const post = await Feed.findById(id);

  if (post) {
    const appLink = `prokutumb://post/${post.id}`;
    const playStoreLink = `https://play.google.com/store/apps/details?id=com.majlis.network`;
    const appStoreLink = `https://apps.apple.com/in/app/majlis-networking/id6741841380`;

    const userAgent = req.headers["user-agent"] || "";
    const isAndroid = /android/i.test(userAgent);
    const isIOS = /iphone|ipad|ipod/i.test(userAgent);

    const storeLink = isIOS ? appStoreLink : playStoreLink;
    const androidIntent = `intent://post/${post.id}#Intent;scheme=prokutumb;package=com.majlis.network;end;`;

    res.send(`
      <html>
      <head>
        <script>
          function openApp() {
            var startTime = Date.now();
            var fallbackTimeout = 2000; // 2 seconds

            function fallback() {
              var elapsed = Date.now() - startTime;
              if (elapsed < fallbackTimeout + 100) {
                window.location.href = "${storeLink}";
              }
            }

            // Open the app using deep linking
            if (${isIOS}) {
              window.location.href = "${appLink}";
            } else if (${isAndroid}) {
              window.location.href = "${androidIntent}";
            }

            // Start fallback timer
            setTimeout(fallback, fallbackTimeout);

            // Cancel fallback if user leaves the page (app opened successfully)
            document.addEventListener("visibilitychange", function() {
              if (document.hidden) {
                clearTimeout(fallback);
              }
            });
          }

          window.onload = openApp;
        </script>
      </head>
      <body>
        <p>Redirecting... If nothing happens, <a href="${storeLink}">click here</a> to download the app.</p>
      </body>
      </html>
    `);
  } else {
    res.status(404).send("Post not found");
  }
});

socketHandler(io, userSocketMap);

const PORT = process.env.PORT || "3001";
server.listen(PORT, () => console.log(`Listening on port: ${PORT}`));
