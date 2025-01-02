const mongoose = require("mongoose");
const { Schema } = mongoose;

const eventSchema = new Schema(
  {
    name: { type: String, required: true },
    location: { type: String },
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
    ocassion: {
      type: String,
      default: "",
    },
    tags: {
      type: String,
      default: "",
    },
    address: {
      type: String,
      default: "",
    },
    date: {
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
  },
  { timestamps: true }
);

const Event = mongoose.model("Event", eventSchema);

module.exports = Event;
