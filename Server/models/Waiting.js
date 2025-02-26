const mongoose = require("mongoose");

const WaitingSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
});

const WaitingList = mongoose.model("WaitingList", WaitingSchema);

module.exports = WaitingList;
