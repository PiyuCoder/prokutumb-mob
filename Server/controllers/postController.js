const Feed = require("../models/Feed");
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

    res.status(201).json(populatedPost);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.fetchPosts = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    // console.log("working");

    // Fetch posts with pagination
    const posts = await Feed.find()
      .populate("user", "name profilePicture")
      .sort({ createdAt: -1 }) // Sort by latest
      .skip((page - 1) * limit) // Skip based on the page number
      .limit(parseInt(limit)); // Limit the number of posts

    // Get total count of posts for client to know when to stop fetching
    const total = await Feed.countDocuments();

    // console.log(posts);

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
