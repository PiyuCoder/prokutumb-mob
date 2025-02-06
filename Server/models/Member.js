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
  dob: {
    type: Date,
  },
  profilePicture: {
    type: String,
  },
  coverPicture: {
    type: String,
  },
  interests: {
    type: [String],
    default: [],
  },
  liveLocation: {
    type: {
      type: String, // 'Point'
      enum: ["Point"], // Define the type
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
    },
  },
  location: {
    type: String,
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
      isPresent: Boolean,
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
  following: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
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
      response: Array, // Stores chatbot conversations
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
  isProfileComplete: {
    type: Boolean,
    default: false,
  },
  socialLinks: [
    {
      platform: String,
      url: String,
      logo: String,
      color: String,
    },
  ],
  referralCode: {
    type: String,
  },
});

memberSchema.index({ liveLocation: "2dsphere" });
const Member = mongoose.model("Member", memberSchema); // Changed to memberSchema to match the export
module.exports = Member;
