// models/Message.js
const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Member",
    required: true,
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Member",
    required: true,
  },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Message",
    default: null,
  },
});

module.exports = mongoose.model("Message", messageSchema);
