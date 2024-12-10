const mongoose = require("mongoose");

// Comment Schema (can be reused for nested replies if needed)
const commentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Member",
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const postSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Member",
    required: true,
  },
  community: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Communitymob",
    required: true,
  },
  content: {
    type: String,
    required: false,
  },
  mediaUrl: {
    type: String,
    required: false,
  },
  mediaType: {
    type: String, // 'image', 'video', or null for text-only
    required: false,
  },
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member", // Array of user IDs who liked the post
    },
  ],
  comments: [commentSchema], // Array of comments (using the commentSchema)
  views: {
    type: Number,
    default: 0,
  },
  shares: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const CommPost = mongoose.model("CommPost", postSchema);

module.exports = CommPost;
