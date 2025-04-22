const Communitymob = require("../models/Community");
const fs = require("fs");
const path = require("path");
const cloudinary = require("../utils/cloudinary");
const streamifier = require("streamifier");
const CommPost = require("../models/CommPost");
const NotificationMob = require("../models/Notification");
const Member = require("../models/Member");
const Event = require("../models/Event");
const Ticket = require("../models/Ticket");
const axios = require("axios");

exports.fetchCommunities = async (req, res) => {
  try {
    const userId = req.params.userId;

    // Fetch all communities (excluding drafts)
    const allCommunities = await Communitymob.find({ isDraft: false })
      .populate("createdBy", "name")
      .sort({ createdAt: -1 });

    // Fetch "Communities You May Like" (Popular Communities)
    const popularCommunities = await Communitymob.find({ isDraft: false })
      .sort({ memberCount: -1 }) // Sort by most members
      .limit(10);

    // Fetch "Communities for You" (Based on User Interests)
    const user = await Member.findById(userId).select("interests");
    const communitiesForYou = await Communitymob.find({
      isDraft: false,
      category: { $in: user.interests }, // Match user's interests
    })
      .populate("createdBy", "name")
      .limit(10);

    const trendingCommunities = await CommPost.aggregate([
      {
        $group: {
          _id: "$community",
          postCount: { $sum: 1 }, // Count posts per community
        },
      },
      { $sort: { postCount: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "communitymobs",
          localField: "_id",
          foreignField: "_id",
          as: "communityDetails",
        },
      },
      { $unwind: "$communityDetails" },
      {
        $lookup: {
          from: "members",
          localField: "communityDetails.createdBy",
          foreignField: "_id",
          as: "createdByDetails",
        },
      },
      {
        $unwind: {
          path: "$createdByDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: "$communityDetails._id",
          name: "$communityDetails.name",
          postCount: 1,
          members: "$communityDetails.members",
          createdBy: {
            _id: "$createdByDetails._id",
            name: "$createdByDetails.name",
          },
          joinRequests: "$communityDetails.joinRequests", // Ensure joinRequests is passed
        },
      },
    ]);

    res.status(200).json({
      success: true,
      allCommunities,
      communitiesYouMayLike: popularCommunities,
      communitiesForYou,
      trendingCommunities,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch communities",
      error: error.message,
    });
  }
};

function getRandomScore() {
  return Math.floor(Math.random() * (100 - 50 + 1)) + 50;
}

exports.fetchCommunity = async (req, res) => {
  try {
    const { communityId, userId } = req.params;
    console.log("fetching community:", communityId);
    const community = await Communitymob.findById(communityId)
      .populate("createdBy", "name profilePicture")
      .populate("members", "name profilePicture");

    const filter = communityId ? { community: communityId } : {};
    const posts = await CommPost.find(filter)
      .populate("comments.user", "name profilePicture")
      .populate("user", "name profilePicture")
      .populate("community", "name")
      .sort({ createdAt: -1 }); // Sort by newest first

    const events = await Event.find({ community: communityId }).sort({
      createdAt: -1,
    });

    const user = await Member.findById(userId);

    // Create strings for AI API
    const profile = `${user.bio} located in ${
      user.location
    } whose interests are ${user.interests.join(
      ", "
    )} and have skills like ${user.skills.join(", ")}`;
    const event_features = `Event ${community.name}, ${community.description} which is ${community.communityType} type happening at ${community.location}`;

    console.log("checking values: ", profile, event_features);
    // Send request to AI similarity API
    const apiResponse = await axios.post(
      "https://majlisserver.com/app2/similarity",
      {
        type: "event", // Assuming this defines the type of similarity check
        profile, // User profile details
        event_features, // Event details
      }
    );

    console.log(apiResponse.data.similarity_score);

    // Extract AI similarity response
    const similarityScore = apiResponse.data.similarity_score || 0;

    res.status(200).json({
      success: true,
      data: community,
      posts,
      events,
      similarityScore,
      socialAvgScore: getRandomScore(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch communities",
      error: error.message,
    });
  }
};

exports.createCommunity = (io, userSocketMap) => async (req, res) => {
  try {
    const {
      name,
      description,
      isAnonymous,
      createdBy,
      timezone,
      category,
      location,
      communityType,
    } = req.body;

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
      profilePicture = `https://${req.get("host")}/backend/uploads/${
        req.file.filename
      }`;

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
      timezone,
      category,
      location,
      communityType,
    });

    await newCommunity.save();

    // Parse invitees and find existing users
    // if (invitees) {
    //   const emails = invitees.split(",").map((email) => email.trim());
    //   const users = await Member.find({ email: { $in: emails } });

    //   for (const user of users) {
    //     const notification = new NotificationMob({
    //       recipientId: user._id, // The invitee
    //       senderId: createdBy, // The creator of the community
    //       message: `You have been invited to join the community "${name}".`,
    //       type: "invitation",
    //       isCommunity: true,
    //       communityId: newCommunity._id,
    //     });

    //     await notification.save();

    //     // Send real-time notification if the user is online
    //     const inviteeSocketId = userSocketMap[user._id.toString()];
    //     if (inviteeSocketId) {
    //       io.to(inviteeSocketId).emit("notification", {
    //         message: notification.message,
    //         type: notification.type,
    //         timestamp: notification.timestamp,
    //       });
    //     }
    //   }
    // }

    res.status(201).json({
      success: true,
      message:
        "Community created successfully and notifications sent to invitees.",
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

exports.createDraftCommunity = async (req, res) => {
  try {
    const {
      name,
      description,
      isAnonymous,
      createdBy,
      timezone,
      category,
      location,
      communityType,
    } = req.body;

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
      profilePicture = `https://${req.get("host")}/backend/uploads/${
        req.file.filename
      }`;

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
      timezone,
      category,
      location,
      communityType,
      isDraft: true,
    });

    await newCommunity.save();

    res.status(201).json({
      success: true,
      message:
        "Community created successfully and notifications sent to invitees.",
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
      "name profilePicture"
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
      type: "join_request",
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

    // Extract the actual _id from senderId
    const senderIdStr = senderId._id.toString(); // Fix here

    // Fetch the community
    const community = await Communitymob.findById(communityId);
    if (!community) {
      return res
        .status(404)
        .json({ success: false, message: "Community not found" });
    }

    console.log("Join Requests:", community.joinRequests);

    // Find request index
    const requestIndex = community.joinRequests.findIndex(
      (request) => request._id.toString() === senderIdStr
    );

    console.log("Request Index:", requestIndex);

    if (requestIndex === -1) {
      return res.status(400).json({
        success: false,
        message: "No join request found for the specified user",
      });
    }

    // Add sender to members & remove from joinRequests
    community.members.push(senderIdStr);
    community.joinRequests.splice(requestIndex, 1);
    await community.save();

    // Mark notification as read
    const notification = await NotificationMob.findOneAndUpdate(
      {
        senderId: senderIdStr,
        type: "join_request",
        recipientId: community.createdBy,
      },
      { status: "read" }
    ).populate("senderId", "name profilePicture");

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

exports.fetchAnEvent = async (req, res) => {
  try {
    const { eventId, userId } = req.params;

    // Fetch event details
    const event = await Event.findById(eventId)
      .populate("createdBy", "name profilePicture")
      .populate("members", "name profilePicture");

    if (!event) {
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });
    }

    console.log(event);

    // Fetch user details
    const user = await Member.findById(userId);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Create strings for AI API
    const profile = `${user.bio} located in ${
      user.location
    } whose interests are ${user.interests.join(
      ", "
    )} and have skills like ${user.skills.join(", ")}`;
    const event_features = `Event ${event.name}, ${event.description} which is ${event.eventType} type happening at ${event.address}`;

    console.log("checking values: ", profile, event_features);
    // Send request to AI similarity API
    const apiResponse = await axios.post(
      "https://majlisserver.com/app2/similarity",
      {
        type: "event", // Assuming this defines the type of similarity check
        profile, // User profile details
        event_features, // Event details
      }
    );

    console.log(apiResponse.data.similarity_score);

    // Extract AI similarity response
    const similarityScore = apiResponse.data.similarity_score || 0;

    // Send final response
    res.status(200).json({
      success: true,
      data: event,
      similarityScore,
    });
  } catch (error) {
    console.error("Error fetching event:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch event",
      error: error.message,
    });
  }
};

exports.bookSeat = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { userId } = req.body;

    const event = await Event.findById(eventId);

    if (!event) {
      res.status(400).json({ message: "Event Not Found." });
    }

    if (event.createdBy.toString() !== userId.toString()) {
      event.members.push(userId);
    }

    const ticket = new Ticket({ buyer: userId, event: eventId });
    await ticket.save();

    await event.save();

    res.status(200).json({ message: "Booked seats!" });
  } catch (error) {
    res.status(500).json({ message: "Server error." });
  }
};

exports.fetchTickets = async (req, res) => {
  try {
    const { userId } = req.params;

    console.log("fetching tickets:", userId);

    const tickets = await Ticket.find({ buyer: userId })
      .populate("event")
      .populate("buyer", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: tickets });
  } catch (error) {
    res.status(500).json({ message: "Server error." });
  }
};

// Fetch all events
exports.fetchAllEvents = async (req, res) => {
  try {
    const { userId } = req.params;
    //populate members and createdBy fields
    const allEvents = await Event.find()
      .populate("members", "_id")
      .populate("createdBy", "name profilePicture")
      .sort({ createdAt: -1 });

    // Fetch user interests and location
    const user = await Member.findById(userId).select("interests location");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // "For You" Events - Events where the user is already a member
    const forYouEvents = await Event.find({
      members: {
        $in: user.friends, // At least one friend is a member
        $nin: [userId], // But the user is NOT a member
      },
      isDraft: false, // Optional: exclude drafts
    })
      .populate("createdBy", "name")
      .limit(5) // Limit to 5 events
      .sort({ createdAt: -1 });

    // "You May Like" Events - Based on user interests or location
    const youMayLikeEvents = await Event.find({
      $or: [
        { category: { $in: user.interests } }, // Match user interests
        { location: user.location }, // Match user location
      ],
      members: { $ne: userId }, // Exclude events the user is already a member of
    })
      .populate("createdBy", "name")
      .limit(5) // Limit to 5 events
      .sort({ membersCount: -1 }); // Sort by most members

    // "Trending" Events - Based on the highest number of members
    const trendingEvents = await Event.aggregate([
      {
        $project: {
          name: 1,
          members: 1, // Include members array
          membersCount: { $size: "$members" }, // Count members array length
          address: 1,
          startDate: 1,
          endDate: 1,
          startTime: 1,
          endTime: 1,
          createdBy: 1, // Keep reference for lookup
        },
      },
      {
        $lookup: {
          from: "members",
          localField: "createdBy",
          foreignField: "_id",
          as: "createdByDetails",
        },
      },
      {
        $unwind: {
          path: "$createdByDetails",
          preserveNullAndEmptyArrays: true, // In case there's no creator info
        },
      },
      {
        $project: {
          name: 1,
          members: 1, // Ensure members array is included in the final result
          membersCount: 1,
          address: 1,
          startDate: 1,
          endDate: 1,
          startTime: 1,
          endTime: 1,
          createdBy: {
            _id: "$createdByDetails._id",
            name: "$createdByDetails.name",
          },
        },
      },
      { $sort: { membersCount: -1 } }, // Sort by highest member count
      { $limit: 5 }, // Get top 5 trending events
    ]);

    res.status(200).json({
      success: true,
      allEvents,
      forYou: forYouEvents,
      youMayLike: youMayLikeEvents,
      trending: trendingEvents,
    });
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch events",
      error: error.message,
    });
  }
};

// Fetch events for a specific community
exports.fetchCommEvents = async (req, res) => {
  try {
    const { communityId } = req.params;

    const events = await Event.find({ community: communityId })
      .populate("createdBy", "name profilePicture")
      .populate("members", "name profilePicture")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: events });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch community events",
      error: error.message,
    });
  }
};

exports.createEvent = (io, userSocketMap) => async (req, res) => {
  try {
    const {
      name,
      description,
      createdBy,
      eventType,
      paidTickets,
      startDate,
      endDate,
      startTime,
      endTime,
      communityId,
      freeTickets,
      address,
      timezone,
      category,
    } = req.body;

    // Validate required fields
    if (!name || !description || !createdBy) {
      return res
        .status(400)
        .json({ error: "Name, description, and createdBy are required" });
    }

    // Process file uploads
    let profilePicture;

    // Handle profile picture upload
    if (req.file) {
      // Save new profile picture
      profilePicture = `https://${req.get("host")}/backend/uploads/${
        req.file.filename
      }`;

      // Check and delete the old profile picture if it exists
      // const existingEvent = await Event.findOne({ createdBy });
      // if (
      //   existingEvent &&
      //   existingEvent.profilePicture?.includes("/uploads/")
      // ) {
      //   const oldFilePath = path.join(
      //     __dirname,
      //     "../uploads/",
      //     path.basename(existingEvent.profilePicture)
      //   );
      //   if (fs.existsSync(oldFilePath)) {
      //     fs.unlinkSync(oldFilePath);
      //   }
      // }
    }

    // Create and save the event
    const event = new Event({
      name,
      timezone,
      description,
      profilePicture,
      createdBy,
      eventType,
      freeTickets,
      startDate,
      endDate,
      startTime,
      endTime,
      community: communityId,
      paidTickets,
      address,
      category,
    });

    await event.save();

    // Parse invitees and find existing users
    // if (invitees) {
    //   const emails = invitees.split(",").map((email) => email.trim());
    //   const users = await Member.find({ email: { $in: emails } });

    //   for (const user of users) {
    //     const notification = new NotificationMob({
    //       recipientId: user._id, // The invitee
    //       senderId: createdBy, // The creator of the community
    //       message: `You have been invited to attend the event "${name}".`,
    //       type: "invitation",
    //       isCommunity: false,
    //       eventId: event._id,
    //     });

    //     await notification.save();

    //     // Send real-time notification if the user is online
    //     const inviteeSocketId = userSocketMap[user._id.toString()];
    //     if (inviteeSocketId) {
    //       io.to(inviteeSocketId).emit("notification", {
    //         message: notification.message,
    //         type: notification.type,
    //         timestamp: notification.timestamp,
    //       });
    //     }
    //   }
    // }

    res.status(201).json({ message: "Event created successfully", event });
  } catch (error) {
    console.error("Error creating event:", error);
    res.status(500).json({ error: "Server error" });
  }
};
exports.createDraftEvent = async (req, res) => {
  try {
    const {
      name,
      description,
      createdBy,
      eventType,
      paidTickets,
      startDate,
      endDate,
      startTime,
      endTime,
      communityId,
      freeTickets,
      address,
      timezone,
      category,
    } = req.body;

    // Validate required fields
    if (!name || !description || !createdBy) {
      return res
        .status(400)
        .json({ error: "Name, description, and createdBy are required" });
    }

    // Process file uploads
    let profilePicture;

    // Handle profile picture upload
    if (req.file) {
      // Save new profile picture
      profilePicture = `https://${req.get("host")}/backend/uploads/${
        req.file.filename
      }`;

      // Check and delete the old profile picture if it exists
      // const existingEvent = await Event.findOne({ createdBy });
      // if (
      //   existingEvent &&
      //   existingEvent.profilePicture?.includes("/uploads/")
      // ) {
      //   const oldFilePath = path.join(
      //     __dirname,
      //     "../uploads/",
      //     path.basename(existingEvent.profilePicture)
      //   );
      //   if (fs.existsSync(oldFilePath)) {
      //     fs.unlinkSync(oldFilePath);
      //   }
      // }
    }

    // Create and save the event
    const event = new Event({
      name,
      timezone,
      description,
      profilePicture,
      createdBy,
      eventType,
      freeTickets,
      startDate,
      endDate,
      startTime,
      endTime,
      community: communityId,
      paidTickets,
      address,
      category,
      isDraft: true,
    });

    await event.save();

    res.status(201).json({ message: "Event created successfully", event });
  } catch (error) {
    console.error("Error creating event:", error);
    res.status(500).json({ error: "Server error" });
  }
};

exports.createPost = async (req, res) => {
  try {
    const { content, communityId, userId, tags } = req.body;
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
      tags,
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
    existingPost.tags = req.body.tags || existingPost.tags;

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
