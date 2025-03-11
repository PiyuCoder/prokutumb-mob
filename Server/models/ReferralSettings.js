const mongoose = require("mongoose");

const ReferralSettingsSchema = new mongoose.Schema({
  referralLimit: { type: Number, default: 6 },
});

module.exports = mongoose.model("ReferralSettings", ReferralSettingsSchema);
