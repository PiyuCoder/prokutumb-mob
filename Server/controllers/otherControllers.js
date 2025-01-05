const Member = require("../models/Member");
const mongoose = require("mongoose");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { SessionsClient } = require("@google-cloud/dialogflow-cx");
const Feed = require("../models/Feed");
const Notification = require("../models/Notification");
const Communitymob = require("../models/Community");
const Event = require("../models/Event");

const updateUserLocation = async (userId, latitude, longitude) => {
  try {
    if (!latitude || !longitude) {
      console.log("Missing latitude or longitude");
      return null;
    }

    const updatedUser = await Member.findByIdAndUpdate(
      userId,
      {
        liveLocation: {
          type: "Point",
          coordinates: [parseFloat(longitude), parseFloat(latitude)],
        },
      },
      { new: true }
    );

    return updatedUser;
  } catch (error) {
    console.error("Error updating location:", error);
    return null;
  }
};

exports.getNearbyUsers = async (req, res) => {
  try {
    const { latitude, longitude, interests, userId } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({ message: "Location is required" });
    }

    console.log("Fetching nearby users for coordinates:", {
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
    });

    // Update the user's live location
    const updatedUser = await updateUserLocation(userId, latitude, longitude);
    if (!updatedUser) {
      return res
        .status(500)
        .json({ message: "Failed to update user location" });
    }

    const interestsArray = Array.isArray(interests) ? interests : [interests];

    const nearbyUsers = await Member.aggregate([
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [parseFloat(longitude), parseFloat(latitude)],
          },
          distanceField: "distance",
          maxDistance: 1000, // 1 km radius
          spherical: true,
          query: {
            friends: { $nin: [new mongoose.Types.ObjectId(userId)] },
            _id: { $ne: new mongoose.Types.ObjectId(userId) },
            ...(interestsArray.length > 0 && interestsArray[0]
              ? { skills: { $in: interestsArray } }
              : {}),
          },
        },
      },
      {
        $project: {
          name: 1,
          location: 1,
          skills: 1,
          profilePicture: 1,
          "liveLocation.coordinates": 1, // Include coordinates for map display
          distance: { $round: ["$distance", 2] }, // Round distance to 2 decimal places
        },
      },
    ]);

    console.log("Found users: ", nearbyUsers);
    res.status(200).json(nearbyUsers);
  } catch (error) {
    console.error("Error fetching nearby users:", error);
    res.status(500).json({ message: "Error fetching nearby users" });
  }
};

async function detectIntentText(query) {
  const client = new SessionsClient();
  const projectId = "grand-icon-439713-i6";
  const location = "us-central1";
  const agentId = "56bc7a84-f538-409e-a354-fcce1cf042a8";
  const languageCode = "en";

  const sessionId = Math.random().toString(36).substring(7);
  const sessionPath = client.projectLocationAgentSessionPath(
    projectId,
    location,
    agentId,
    sessionId
  );
  const request = {
    session: sessionPath,
    queryInput: {
      text: {
        text: query,
      },
      languageCode,
    },
  };
  const [response] = await client.detectIntent(request);
  for (const message of response.queryResult.responseMessages) {
    if (message.text) {
      console.log(`Agent Response: ${message.text.text}`);
    }
  }
  if (response.queryResult.match.intent) {
    console.log(
      `Matched Intent: ${response.queryResult.match.intent.displayName}`
    );
  }
  console.log(`Current Page: ${response.queryResult.currentPage.displayName}`);
}

exports.prokuInteraction = async (req, res) => {
  const { userId, query } = req.body;

  console.log(userId, query);

  try {
    const genAI = new GoogleGenerativeAI(
      "AIzaSyA2MXxVjM_sygMcocVFRfvyvZKQicvvc38"
    );
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = "Explain how AI works";

    const result = await model.generateContent(query);
    // detectIntentText(query);
    console.log(result.response.text());
    const responseText = result.response.text();

    // Save user query and AI response to the database
    const member = await Member.findById(userId);
    const interaction = {
      query,
      response: responseText,
      createdAt: new Date(),
    };
    member.chatbotInteractions.push(interaction);
    await member.save();

    // Send both user query and AI response to the frontend
    res.status(200).json({ query, response: responseText });
  } catch (error) {
    console.error("Error handling interaction:", error);
    res.status(500).json({ error: "Failed to handle interaction" });
  }
};

exports.fetchProkuInteractions = async (req, res) => {
  const { userId } = req.params;
  try {
    const member = await Member.findById(userId);
    res.status(200).json(member.chatbotInteractions);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve interactions" });
  }
};

exports.searchPeople = async (req, res) => {
  try {
    const { q } = req.query; // Use req.query to get query parameters

    const users = await Member.find({
      $or: [
        { name: { $regex: q, $options: "i" } }, // Corrected `$option` to `$options`
        { email: { $regex: q, $options: "i" } },
      ],
    }).limit(7);

    // console.log(users);
    res.status(200).json(users);
  } catch (error) {
    console.error("Error in searchPeople:", error); // Added for easier debugging
    res.status(500).json({ message: "Server error" });
  }
};

exports.searchCommunity = async (req, res) => {
  try {
    const { q } = req.query; // Use req.query to get query parameters

    const communitites = await Communitymob.find({
      $or: [
        { name: { $regex: q, $options: "i" } }, // Corrected `$option` to `$options`
      ],
    }).limit(7);

    // console.log(users);
    res.status(200).json(communitites);
  } catch (error) {
    console.error("Error in searchPeople:", error); // Added for easier debugging
    res.status(500).json({ message: "Server error" });
  }
};

exports.searchEvent = async (req, res) => {
  try {
    const { q } = req.query; // Use req.query to get query parameters

    const events = await Event.find({
      $or: [
        { name: { $regex: q, $options: "i" } }, // Corrected `$option` to `$options`
      ],
    }).limit(7);

    // console.log(users);
    res.status(200).json(events);
  } catch (error) {
    console.error("Error in searchPeople:", error); // Added for easier debugging
    res.status(500).json({ message: "Server error" });
  }
};

exports.getRecentPosts = async (req, res) => {
  try {
    const { userId } = req.query; // Get the logged-in user's ID from query params

    // Fetch the user's connections (friends)
    const user = await Member.findById(userId).populate(
      "friends",
      "name profilePicture"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get the IDs of user's friends (connections)
    const connectionIds = user.friends.map((friend) => friend._id);

    // Aggregation to get the most recent post from each connection
    const recentPosts = await Feed.aggregate([
      {
        $match: { user: { $in: connectionIds } }, // Match posts from connections
      },
      {
        $sort: { createdAt: -1 }, // Sort posts by creation date in descending order (most recent first)
      },
      {
        $group: {
          _id: "$user", // Group by user (each user will have only one post)
          postId: { $first: "$_id" }, // Take the first post (most recent due to sorting)
        },
      },
      {
        $lookup: {
          from: "members", // Look up in the `Member` collection
          localField: "_id", // Match the user ID from the grouped posts
          foreignField: "_id", // Match the `user` field from the `Feed`
          as: "userDetails", // Output the result to the `userDetails` array
        },
      },
      {
        $unwind: "$userDetails", // Unwind the `userDetails` array
      },
      {
        $project: {
          _id: 0,
          id: "$postId", // Rename postId to id for the response
          name: "$userDetails.name", // Get name from `userDetails`
          image: "$userDetails.profilePicture", // Get profilePicture from `userDetails`
          userId: "$_id", // Get the user ID
        },
      },
    ]);

    res.status(200).json(recentPosts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.getNotifications = async (req, res) => {
  try {
    const { userId } = req.params;

    const notifications = await Notification.find({ recipientId: userId })
      .populate("senderId", "name profilePicture") // Sort by latest notifications
      .sort({ timestamp: -1 })
      .exec();

    res.status(200).json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ message: "Error fetching notifications." });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.body;

    // Find the notification and update the status to "read"
    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { status: "read" },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found." });
    }

    res.status(200).json({ message: "Notification marked as read." });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res
      .status(500)
      .json({ message: "Server error while marking notification as read." });
  }
};
