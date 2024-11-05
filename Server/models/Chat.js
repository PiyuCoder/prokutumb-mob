const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({
  chatbotInteractions: [
    {
      query: String,
      response: String,
      createdAt: { type: Date, default: Date.now },
    },
  ],
});

module.exports = mongoose.model("Chat", chatSchema);
