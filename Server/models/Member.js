const mongoose = require("mongoose");

const memberSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
  },
  // password: {
  //   type: String,
  //   required: true,
  // },
  profilePicture: {
    type: String,
  },
  interests: {
    type: Array,
  },
  liveLocation: {
    type: {
      type: String, // 'Point'
      enum: ["Point"], // Define the type
      required: true,
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
    },
  },
  location: {
    state: {
      type: String,
    },
    country: {
      type: String,
    },
  },
  googleId: {
    type: String,
  },
  linkedinProfile: {
    url: {
      type: String,
    },
    importedData: {
      type: Map, // To store imported LinkedIn data (e.g., positions, skills, etc.)
      of: String,
    },
  },
  bio: {
    type: String,
  },
  skills: {
    type: [String], // List of skills the user possesses
  },
  experience: [
    {
      company: String,
      role: String,
      startDate: Date,
      endDate: Date,
      isPresent: Boolean,
      description: String,
    },
  ],
  education: [
    {
      school: String,
      degree: String,
      fieldOfStudy: String,
      startDate: Date,
      endDate: Date,
    },
  ],
  friends: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member", // References to other users
      addedAt: {
        type: Date,
        default: Date.now,
      },
      usefulnessDescription: String, // How this friend is useful in the "Kutumb tree"
    },
  ],
  friendRequests: [
    {
      fromUser: { type: mongoose.Schema.Types.ObjectId, ref: "Member" },
      status: {
        type: String,
        enum: ["pending", "accepted", "rejected"],
        default: "pending",
      },
      requestedAt: { type: Date, default: Date.now },
    },
  ],
  potentialConnections: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "Member" },
      howUseful: String, // Description of how this person might be useful
    },
  ],
  jobSeeking: {
    isJobSeeking: { type: Boolean, default: false },
    company: String, // The company the user is targeting
    role: String, // The role the user is targeting
    networkForReference: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Member",
      },
    ], // People in the network who can provide a reference
  },
  chatbotInteractions: [
    {
      query: String,
      response: String, // Stores chatbot conversations
      createdAt: { type: Date, default: Date.now },
    },
  ],
  qrCodeData: {
    qrCodeUrl: { type: String }, // URL to generate the user's QR code for connecting
    nfcTag: { type: String }, // NFC tag data if relevant
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

memberSchema.index({ liveLocation: "2dsphere" });
const Member = mongoose.model("Member", memberSchema); // Changed to memberSchema to match the export
module.exports = Member;