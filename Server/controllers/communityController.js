const Communitymob = require("../models/Community");
const fs = require("fs");
const path = require("path");
const cloudinary = require("../utils/cloudinary");
const streamifier = require("streamifier");
const CommPost = require("../models/CommPost");
const NotificationMob = require("../models/Notification");
const Member = require("../models/Member");

exports.fetchCommunities = async (req, res) => {
  try {
    const communities = await Communitymob.find().populate("createdBy", "name"); // Populates creator details if needed
    res.status(200).json({ success: true, data: communities });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch communities",
      error: error.message,
    });
  }
};

exports.fetchCommunity = async (req, res) => {
  try {
    const { communityId } = req.params;

    const community = await Communitymob.findById(communityId).populate(
      "createdBy",
      "name profilePicture"
    ); // Populates creator details if needed

    const filter = communityId ? { community: communityId } : {};
    const posts = await CommPost.find(filter)
      .populate("user", "name profilePicture")
      .populate("community", "name")
      .sort({ createdAt: -1 }); // Sort by newest first

    // res.status(200).json({
    //   success: true,
    //   message: "Posts fetched successfully",
    //   posts,
    // });
    res.status(200).json({ success: true, data: community, posts });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch communities",
      error: error.message,
    });
  }
};

exports.createCommunity = async (req, res) => {
  try {
    const { name, description, isAnonymous, createdBy } = req.body;

    // Validate required fields
    if (!name || !description || !createdBy) {
      return res.status(400).json({
        success: false,
        message: "Name, description, and creator are required.",
      });
    }

    let profilePicture;

    // Handle profile picture upload
    if (req.file) {
      // Save new profile picture
      profilePicture = `https://${req.get("host")}/uploads/${
        req.file.filename
      }`;

      // Check and delete the old profile picture if it exists
      const community = await Communitymob.findOne({ createdBy });
      if (community && community.profilePicture?.includes("/uploads/")) {
        const oldFilePath = path.join(
          __dirname,
          "../uploads/",
          path.basename(community.profilePicture)
        );
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }
    }

    // Create new community
    const newCommunity = new Communitymob({
      name,
      description,
      isAnonymous: isAnonymous || false,
      profilePicture,
      createdBy,
    });

    await newCommunity.save();

    res.status(201).json({
      success: true,
      message: "Community created successfully",
      data: newCommunity,
    });
  } catch (error) {
    console.error("Error creating community:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to create community",
      error: error.message,
    });
  }
};

exports.joinCommunity = (io, userSocketMap) => async (req, res) => {
  try {
    console.log("working");
    const { userId } = req.body; // The user who wants to join the community
    const { communityId } = req.params;

    // Fetch the community details and populate the createdBy field
    const community = await Communitymob.findById(communityId).populate(
      "createdBy",
      "name profilePicture _id"
    );

    if (!community) {
      return res.status(404).json({
        success: false,
        message: "Community not found",
      });
    }

    // Push the join request to the community's joinRequests array
    await community.joinRequests.push(userId);
    await community.save();

    // Fetch the details of the user sending the request
    const sender = await Member.findById(userId);

    if (!sender) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Create a notification for the community owner
    const notification = new NotificationMob({
      recipientId: community.createdBy._id, // The owner of the community
      senderId: userId, // The user making the join request
      message: `${sender.name} has requested to join your community "${community.name}".`,
      type: "join request",
      isCommunity: true,
      communityId: communityId,
    });

    // console.log(notification);

    await notification.save();

    const receiverId = community.createdBy._id.toString();
    // Send a real-time notification to the owner if they are online
    // console.log(ownerSocketId, receiverId);
    const ownerSocketId = userSocketMap[receiverId];

    if (ownerSocketId) {
      io.to(ownerSocketId).emit("notification", {
        message: notification.message,
        type: notification.type,
        timestamp: notification.timestamp,
      });
    }

    res.status(200).json({
      success: true,
      message: "Join request sent and owner notified.",
      data: community,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to process join request",
      error: error.message,
    });
  }
};

exports.acceptRequest = async (req, res) => {
  try {
    const { communityId } = req.params;
    const { senderId } = req.body;

    console.log(communityId, senderId);

    // Fetch the community
    const community = await Communitymob.findById(communityId);
    if (!community) {
      return res
        .status(404)
        .json({ success: false, message: "Community not found" });
    }

    // Check if the sender has a pending request
    const requestIndex = community.joinRequests.findIndex(
      (req) => req._id.toString() === senderId.toString()
    );

    console.log(requestIndex);
    if (requestIndex === -1) {
      return res.status(400).json({
        success: false,
        message: "No join request found for the specified user",
      });
    }

    // Add the sender to the members list and remove from joinRequests
    community.members.push(senderId);
    community.joinRequests.splice(requestIndex, 1);
    await community.save();

    // Update the notification as "read"
    const notification = await NotificationMob.findOneAndUpdate(
      { senderId, type: "join request", recipientId: community.createdBy },
      { status: "read" }
    );

    return res.status(200).json({
      success: true,
      message: "Join request accepted",
      data: notification,
    });
  } catch (error) {
    console.error("Error accepting join request:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while accepting the join request",
      error: error.message,
    });
  }
};

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

exports.createPost = async (req, res) => {
  try {
    const { content, communityId, userId } = req.body;
    // console.log(req.file);

    if (!communityId || !userId) {
      return res.status(400).json({
        success: false,
        message: "Community ID and User ID are required.",
      });
    }

    let mediaUrl = null;
    let mediaType = null;

    // Handle media upload
    if (req.file) {
      const fileType = req.file.mimetype.split("/")[0]; // Determine type: 'image' or 'video'

      const uploadType =
        fileType === "image" ? "image" : fileType === "video" ? "video" : null;
      if (uploadType) {
        const result = await uploadToCloudinary(req.file, uploadType);
        mediaUrl = result.secure_url;
        mediaType = uploadType;
      }
    }

    // Create the new post
    const newPost = new CommPost({
      user: userId,
      community: communityId,
      content,
      mediaUrl,
      mediaType,
    });

    const savedPost = await newPost.save();

    // Populate the user and community details
    const populatedPost = await CommPost.findById(savedPost._id)
      .populate("user", "name profilePicture")
      .populate("community", "name");

    res.status(201).json({
      success: true,
      message: "Post created successfully",
      post: populatedPost,
    });
  } catch (error) {
    console.error("Error creating post:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to create post",
      error: error.message,
    });
  }
};

exports.editPost = async (req, res) => {
  try {
    let mediaUrl = null;
    let mediaType = null;

    const { postId } = req.params;

    // console.log("editpost:", postId);

    // Find the existing post by ID
    const existingPost = await CommPost.findById(postId);

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

    // Save the updated post
    const updatedPost = await existingPost.save();

    // Populate user info after updating
    const populatedPost = await CommPost.findById(updatedPost._id).populate(
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

    const existingPost = await CommPost.findByIdAndDelete(postId);

    if (!existingPost) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.status(200).json({ message: "Deleted post." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.likePost = async (req, res) => {
  try {
    const { userId } = req.body; // User ID from the client
    console.log(userId);
    const post = await CommPost.findById(req.params.postId);

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
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.incerementPostShare = async (req, res) => {
  try {
    const post = await CommPost.findById(req.params.postId);

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

    // Find the post by ID
    const post = await CommPost.findById(req.params.postId);

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
    const populatedPost = await CommPost.findById(post._id).populate({
      path: "comments.user",
      select: "name profilePicture", // Select only name and profilePicture fields
    });

    // Get the last comment added (the one just added)
    const lastComment =
      populatedPost.comments[populatedPost.comments.length - 1];

    res.json(lastComment); // Return the newly added comment with user details
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};