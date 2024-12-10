const mongoose = require("mongoose");
const { Schema } = mongoose;

const communitySchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    isAnonymous: { type: Boolean, default: false },
    profilePicture: { type: String },
    coverPicture: { type: String },
    members: [
      {
        type: Schema.Types.ObjectId,
        ref: "Member",
      },
    ],
    joinRequests: [
      {
        userId: {
          type: Schema.Types.ObjectId,
          ref: "Member",
        },
        requestDate: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "Member",
    },
  },
  { timestamps: true }
);

const Communitymob = mongoose.model("Communitymob", communitySchema);

module.exports = Communitymob;
