const Member = require("../models/Member");
const mongoose = require("mongoose");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { SessionsClient } = require("@google-cloud/dialogflow-cx");
const Feed = require("../models/Feed");
const Notification = require("../models/Notification");
const Communitymob = require("../models/Community");
const Event = require("../models/Event");
const axios = require("axios");

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

function filterValidResponses(data, queryType) {
  const uniqueIds = new Set(); // Track unique _id values

  return data.filter(({ output, _id, type }) => {
    if (type === undefined) {
      console.log(
        `❌ Skipping response due to missing type: ${JSON.stringify({
          _id,
          output,
        })}`
      );
      return false;
    }

    type = type.toString();

    if (!["1", "2", "3", "4"].includes(type)) {
      console.log(
        `❌ Skipping response due to invalid type: ${JSON.stringify({
          _id,
          type,
          output,
        })}`
      );
      return false;
    }

    // **Ensure uniqueness based on `_id`**
    if (_id && uniqueIds.has(_id)) {
      console.log(`❌ Skipping duplicate: ${_id}`);
      return false;
    }
    uniqueIds.add(_id);

    console.log(
      `✅ Keeping response: ${JSON.stringify({ _id, type, output })}`
    );
    return true;
  });
}

exports.prokuInteraction = async (req, res) => {
  const { userId, query, queryType, id } = req.body;

  console.log("queryType:", queryType);

  try {
    const user = await Member.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    let updatedQuery;

    const ensureQuestionMark = (text) =>
      text.trim().endsWith("?") ? text : text + "?";

    const formattedQuery = ensureQuestionMark(query);

    if (queryType === "profile") {
      const interestsString = user.interests?.join(", ") || "";
      const skillsString = user.skills?.join(", ") || "";
      const location = user.location || "";
      const educationString =
        user.education
          ?.map(
            (edu) => `${edu.degree} in ${edu.fieldOfStudy} from ${edu.school}`
          )
          .join(", ") || "";
      const experienceString =
        user.experience
          ?.map((exp) => `${exp.role} at ${exp.company}`)
          .join(", ") || "";

      updatedQuery = {
        question: formattedQuery,
        labelinfo:
          `${interestsString} ${skillsString} ${location} ${educationString} ${experienceString}`.trim(),
      };
    } else if (queryType === "community") {
      const community = await Communitymob.findById(id);
      updatedQuery = community
        ? {
            question: formattedQuery,
            labelinfo: `A community focused on ${community.communityType} in ${community.location}. ${community.description}`,
          }
        : { question: query, labelinfo: `A community ${query}` };
    } else {
      const event = await Event.findById(id);
      updatedQuery = event
        ? {
            question: formattedQuery,
            labelinfo: `${event.name} ${event.address} ${event.eventType}`,
          }
        : { question: formattedQuery, labelinfo: `event ${query}` };
    }

    console.log("Populated query: ", updatedQuery);

    // Call AI API
    const apiResponse = await axios.post(
      "http://34.150.183.91:5000/query",
      updatedQuery,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log("AI API Response:", apiResponse.data);

    // Ensure responseText is an array
    let responseText = apiResponse.data.response || [];
    if (!Array.isArray(responseText)) {
      responseText = [responseText];
    }

    // Filter valid responses
    responseText = filterValidResponses(responseText, queryType);

    // Function to clean and validate IDs
    const cleanIds = (ids) =>
      ids
        .map((id) => id.trim()) // Remove spaces
        .filter((id) => /^[a-f\d]{24}$/i.test(id)) // Only valid 24-character hex IDs
        .map((id) => new mongoose.Types.ObjectId(id)); // Convert to ObjectId

    // **Fetch user details for `type: 1`**
    const userIds = cleanIds(
      responseText.filter((resp) => resp.type === 1).map((resp) => resp._id)
    );
    const users = await Member.find({ _id: { $in: userIds } });

    // **Fetch community details for `type: 3`**
    const communityIds = cleanIds(
      responseText.filter((resp) => resp.type === 3).map((resp) => resp._id)
    );
    const communities = await Communitymob.find({ _id: { $in: communityIds } });

    // **Fetch event details for `type: 2`**
    const eventIds = cleanIds(
      responseText.filter((resp) => resp.type === 2).map((resp) => resp._id)
    );
    console.log("Cleaned Event IDs:", eventIds);

    const events = await Event.find({ _id: { $in: eventIds } });
    console.log("Fetched Events:", events);

    // Map fetched details to their respective responses

    const userMap = new Map(users.map((user) => [user._id.toString(), user]));
    const communityMap = new Map(
      communities.map((comm) => [comm._id.toString(), comm])
    );
    const eventMap = new Map(events.map((evt) => [evt._id.toString(), evt]));

    console.log("eventMap: ", eventMap);
    responseText = responseText.map((resp) => {
      if (resp.type === 1) {
        const userDetails = userMap.get(resp._id);
        if (userDetails) {
          return {
            ...resp,
            userDetails: {
              name: userDetails.name,
              profilePicture: userDetails.profilePicture || "",
              location: userDetails.location || "",
            },
          };
        }
      } else if (resp.type === 3) {
        const communityDetails = communityMap.get(resp._id);
        if (communityDetails) {
          return {
            ...resp,
            communityDetails: {
              name: communityDetails.name,
              location: communityDetails.location || "",
              communityType: communityDetails.communityType || "",
            },
          };
        }
      } else if (resp.type === 2) {
        const eventDetails = eventMap.get(resp._id);
        console.log(eventDetails);
        if (eventDetails) {
          return {
            ...resp,
            eventDetails: {
              name: eventDetails.name,
              address: eventDetails.address || "",
              eventType: eventDetails.eventType || "",
              date: eventDetails.date || "",
            },
          };
        }
      }
      return resp;
    });

    const limitedResponse =
      responseText.length > 10 ? responseText.slice(0, 10) : responseText;

    // Save interaction to the database
    user.chatbotInteractions.push({
      query,
      response: limitedResponse,
      createdAt: new Date(),
    });

    await user.save();

    // Return response to frontend
    res.status(200).json({ query, response: limitedResponse });
  } catch (error) {
    console.error("Error handling interaction:", error);
    res.status(500).json({ error: "Failed to handle interaction" });
  }
};

exports.fetchProkuInteractions = async (req, res) => {
  const { userId } = req.params;
  console.log(userId);
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
    console.log(q);

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
    console.log(q);
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
