const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member", // The user who will receive the notification
      required: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member", // The user who triggered the notification (e.g., the sender of the connection request)
      required: true,
    },
    message: {
      type: String, // The message to display
      required: true,
    },
    type: {
      type: String, // Type of notification (e.g., "connection request", "message", "call")
      required: true,
    },
    status: {
      type: String, // The status of the notification (e.g., "unread", "read")
      default: "unread", // By default, notifications are unread
    },
    timestamp: {
      type: Date,
      default: Date.now, // Automatically set the timestamp to the current date/time
    },
  },
  { timestamps: true }
);

const Notification = mongoose.model("Notification", notificationSchema);

module.exports = Notification;
