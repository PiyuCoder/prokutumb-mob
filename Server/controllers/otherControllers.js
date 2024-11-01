const Member = require("../models/Member");
const mongoose = require("mongoose");

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

    // Log the coordinates
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

    // Ensure interests is an array
    const interestsArray = Array.isArray(interests) ? interests : [interests];

    const nearbyUsers = await Member.find({
      liveLocation: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(longitude), parseFloat(latitude)],
          },
          $minDistance: 0, // Adjust as needed
          $maxDistance: 5000000, // For example, 50 km
        },
      },
      // skills: { $in: interestsArray }, // Filter by skills
      // friends: { $nin: [new mongoose.Types.ObjectId(userId)] }, // Exclude friends
    });

    console.log("Found users: ", nearbyUsers.length);
    res.status(200).json(nearbyUsers);
  } catch (error) {
    console.error("Error fetching nearby users:", error);
    res.status(500).json({ message: "Error fetching nearby users" });
  }
};
