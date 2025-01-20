const mongoose = require("mongoose");
const { Schema } = mongoose;

const eventSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    profilePicture: { type: String },
    coverPicture: { type: String },
    members: [
      {
        type: Schema.Types.ObjectId,
        ref: "Member",
      },
    ],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "Member",
    },
    eventType: {
      type: String,
      default: "public",
    },
    timezone: {
      type: String,
      default: "",
    },
    address: {
      type: String,
      default: "",
    },
    startDate: {
      type: String,
      default: "",
    },
    endDate: {
      type: String,
      default: "",
    },
    startTime: {
      type: String,
      default: "",
    },
    endTime: {
      type: String,
      default: "",
    },
    community: {
      type: Schema.Types.ObjectId,
      ref: "Communitymob",
    },
    freeTickets: {
      type: Number,
    },
    paidTickets: {
      type: Number,
    },
  },
  { timestamps: true }
);

const Event = mongoose.model("Event", eventSchema);

module.exports = Event;
