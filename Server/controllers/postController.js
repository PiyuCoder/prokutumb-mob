const { sendPushNotification } = require("../config/oneSignal");
const Feed = require("../models/Feed");
const Member = require("../models/Member");
const cloudinary = require("../utils/cloudinary");
const streamifier = require("streamifier");

// Function to upload media to Cloudinary
const uploadToCloudinary = (file, resourceType) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { resource_type: resourceType, folder: "posts" }, // Folder name in Cloudinary
      (error, result) => {
        if (error) {
          return reject(error);
        }
        resolve(result);
      }
    );

    streamifier.createReadStream(file.buffer).pipe(uploadStream);
  });
};

// Create post controller function
exports.createPost = async (req, res) => {
  try {
    let mediaUrl = null;
    let mediaType = null;

    // Check if a file is attached
    if (req.file) {
      const fileType = req.file.mimetype.split("/")[0]; // 'image' or 'video'

      console.log(req.file);

      // Upload file to Cloudinary
      let result;
      if (fileType === "image") {
        result = await uploadToCloudinary(req.file, "image");
        mediaUrl = result.secure_url; // Image URL from Cloudinary
        mediaType = "image";
      } else if (fileType === "video") {
        result = await uploadToCloudinary(req.file, "video");
        mediaUrl = result.secure_url; // Video URL from Cloudinary
        mediaType = "video";
      }
    }

    // Create new post in the database
    const newPost = new Feed({
      user: req.body.user, // Assuming user ID is provided in the request body
      content: req.body.content || "",
      tags: req.body.tags || [],
      mediaUrl, // Save media URL (image or video) in the post
      mediaType, // Media type (image or video)
    });

    // Save the post to the database
    const savedPost = await newPost.save();

    // Populate user info after saving
    const populatedPost = await Feed.findById(savedPost._id).populate(
      "user",
      "name profilePicture"
    );

    console.log("Post created:", populatedPost);

    res.status(201).json(populatedPost);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.editPost = async (req, res) => {
  try {
    let mediaUrl = null;
    let mediaType = null;

    const { postId } = req.params;

    // console.log("editpost:", postId);

    // Find the existing post by ID
    const existingPost = await Feed.findById(postId);

    if (!existingPost) {
      return res.status(404).json({ message: "Post not found" });
    }
    // console.log(req.file);

    // Check if a file is attached and process it
    if (req.file) {
      const fileType = req.file.mimetype.split("/")[0]; // 'image' or 'video'

      let result;
      if (fileType === "image") {
        result = await uploadToCloudinary(req.file, "image");
        mediaUrl = result.secure_url; // Image URL from Cloudinary
        mediaType = "image";
      } else if (fileType === "video") {
        result = await uploadToCloudinary(req.file, "video");
        mediaUrl = result.secure_url; // Video URL from Cloudinary
        mediaType = "video";
      }
    }

    // Update the existing post
    existingPost.content = req.body.content || existingPost.content;
    existingPost.mediaUrl = mediaUrl || existingPost.mediaUrl;
    existingPost.mediaType = mediaType || existingPost.mediaType;
    existingPost.tags = req.body.tags || existingPost.tags;

    // Save the updated post
    const updatedPost = await existingPost.save();

    // Populate user info after updating
    const populatedPost = await Feed.findById(updatedPost._id).populate(
      "user",
      "name profilePicture"
    );

    res.status(200).json(populatedPost);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const { postId } = req.params;

    const existingPost = await Feed.findByIdAndDelete(postId);

    if (!existingPost) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.status(200).json({ message: "Deleted post." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.fetchPosts = async (req, res) => {
  try {
    const { userId } = req.params; // Pass the userId in the request body
    const { page = 1, limit = 10 } = req.query;

    console.log(userId);

    // Fetch the user's friends
    const user = await Member.findById(userId).select("friends");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const friendsIds = user.friends.map((friend) => friend._id); // Extract friends' IDs

    // Fetch posts created by the user or their friends
    const posts = await Feed.find({
      user: { $in: [userId, ...friendsIds] }, // Match userId or any friend's ID
    })
      .populate("user", "name profilePicture") // Populate post creator
      .populate({
        path: "comments.user", // Populate comment user
        select: "name profilePicture", // Include name and profilePicture
      })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean(); // Convert MongoDB documents to plain JavaScript objects

    const total = await Feed.countDocuments({
      user: { $in: [userId, ...friendsIds] }, // Count only matching posts
    });

    res.json({
      posts,
      total,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.fetchPost = async (req, res) => {
  const { id } = req.params;
  const post = await Feed.findById(id)
    .populate("user", "name profilePicture") // Populate post creator
    .populate({
      path: "comments.user", // Populate comment user
      select: "name profilePicture", // Include name and profilePicture
    })
    .lean();
  if (post) {
    res.json(post); // API response for post data
    // res.redirect(`prokutumb://post/${post.id}`);

    // Or render an HTML page for web apps
  } else {
    res.status(404).send("Post not found");
  }
};

exports.likePost = async (req, res) => {
  try {
    const { userId } = req.body; // User ID from the client
    const post = await Feed.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Toggle like
    if (post.likes.includes(userId)) {
      post.likes = post.likes.filter((id) => id.toString() !== userId);
    } else {
      post.likes.push(userId);
    }

    await post.save();
    res.json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.incrementPostView = async (req, res) => {
  try {
    const post = await Feed.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    post.views += 1;
    await post.save();
    res.json({ message: "Views incremented" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.incerementPostShare = async (req, res) => {
  try {
    const post = await Feed.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    post.shares += 1;
    await post.save();
    res.json({ message: "Shares incremented" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.addComment = async (req, res) => {
  try {
    const { userId, content } = req.body;
    console.log("adding comment:", userId, content);

    // Find the post by ID
    const post = await Feed.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Create a new comment
    const newComment = {
      user: userId,
      content,
    };

    // Push the comment to the post's comments array
    post.comments.push(newComment);
    await post.save();

    // Populate the user details for the newly added comment
    const populatedPost = await Feed.findById(post._id).populate({
      path: "comments.user",
      select: "name profilePicture",
    });

    const lastComment =
      populatedPost.comments[populatedPost.comments.length - 1];

    // 🔔 Send push notification to post owner (if not commenting on own post)
    if (userId !== post.user.toString()) {
      const senderUser = await Member.findById(userId).select(
        "name profilePicture"
      );
      await sendPushNotification(
        post.user.toString(), // receiverId
        userId, // senderId
        "New Comment", // title
        `${senderUser.name} commented on your post`, // message
        "comment", // type
        "Post", // screen to open on click
        { postId: post._id } // params
      );
    }

    res.json(lastComment);
  } catch (error) {
    console.error("Add comment error:", error);
    res.status(500).json({ error: error.message });
  }
};
