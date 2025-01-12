const Message = require("../models/Message");

const onlineUsers = {};

const socketHandler = (io, userSocketMap) => {
  io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);

    // Handle user registration
    socket.on("registerUser", (userId) => {
      userSocketMap[userId] = socket.id;
      onlineUsers[userId] = true;
      console.log(`User ${userId} registered with socket ID ${socket.id}`);
      console.log("Current userSocketMap:", userSocketMap); // Log entire map for troubleshooting

      // Emit online status
      io.emit("userStatus", { userId, online: true });
    });

    // Listen for `sendMessage` event
    socket.on("sendMessage", async ({ sender, recipient, text, replyTo }) => {
      try {
        console.log(
          `Message from ${sender} to ${recipient}: ${text} : replyTo:${replyTo}`
        );

        // Create a new message document
        const message = new Message({
          sender,
          recipient,
          text,
          replyTo: replyTo || null, // Ensure null is used if no reply
          timestamp: Date.now(), // Ensure timestamp is set if it's not auto-generated
        });

        // Save the message to the database
        await message.save();

        // Emit message to recipient if they're online
        const recipientSocketId = userSocketMap[recipient];
        if (recipientSocketId) {
          // Send the message along with the replyTo field (if it exists)
          io.to(recipientSocketId).emit("receiveMessage", {
            sender,
            text,
            timestamp: message.timestamp,
            replyTo: message.replyTo, // Sending the reference to the original message
          });
          console.log(`Message sent to recipient ${recipient}`);

          // Emit a notification to the recipient about the new message
          io.to(recipientSocketId).emit("newMessage", {
            sender,
            text,
            timestamp: message.timestamp,
          });
        } else {
          console.log(`Recipient ${recipient} is not connected`);
        }
      } catch (error) {
        console.error("Error sending message:", error);
      }
    });

    // Handle sending friend requests
    socket.on("sendFriendRequest", async ({ sender, recipient }) => {
      try {
        console.log(`Friend request from ${sender} to ${recipient}`);

        // Here, you would handle saving the friend request to the database
        // Example: Add the friend request to the recipient's list in the database (not shown here)

        // Emit notification to recipient about the new friend request
        const recipientSocketId = userSocketMap[recipient];
        if (recipientSocketId) {
          io.to(recipientSocketId).emit("newFriendRequest", {
            sender,
            message: "You have a new friend request!",
          });
          console.log(`Friend request sent to recipient ${recipient}`);
        } else {
          console.log(`Recipient ${recipient} is not connected`);
        }
      } catch (error) {
        console.error("Error sending friend request:", error);
      }
    });

    // Handle call initiation
    socket.on("initiateCall", (data) => {
      const { recipientId, callerId, callerName, isVideo, recipientName } =
        data;
      console.log(`Call initiated from ${callerName} to ${recipientName}`);

      // Look up recipient's socket ID
      const recipientSocketId = userSocketMap[recipientId];

      if (recipientSocketId) {
        io.to(recipientSocketId).emit("incomingCall", {
          callerId,
          callerName,
          recipientName,
          isVideo,
          recipientId,
        });
        console.log(`Incoming call sent to recipient ${recipientId}`);
      } else {
        console.log(`Recipient ${recipientId} is not connected`);
      }
    });

    socket.on("callAccepted", (data) => {
      const { callerId, recipientId, callerName } = data;

      // Send the "callAccepted" event to the caller
      const callerSocketId = userSocketMap[callerId];
      if (callerSocketId) {
        io.to(callerSocketId).emit("callAccepted", {
          callerId,
          recipientId,
          callerName,
        });
      }
    });

    // Handle call decline
    socket.on("callEnded", (data) => {
      const { callerId, recipientId } = data;

      // Notify both the caller and recipient that the call has ended
      const callerSocketId = userSocketMap[callerId];
      const recipientSocketId = userSocketMap[recipientId];

      if (callerSocketId) {
        io.to(callerSocketId).emit("callEnded");
      }

      if (recipientSocketId) {
        io.to(recipientSocketId).emit("callEnded");
      }
    });

    // Handle user disconnection
    socket.on("disconnect", () => {
      console.log(`Client ${socket.id} disconnected`);

      // Find userId associated with this socket and remove
      for (const userId in userSocketMap) {
        if (userSocketMap[userId] === socket.id) {
          delete userSocketMap[userId];
          delete onlineUsers[userId];
          io.emit("userStatus", { userId, online: false });
          console.log(`User ${userId} removed from userSocketMap`);
          break;
        }
      }
    });
  });
};

module.exports = socketHandler;
