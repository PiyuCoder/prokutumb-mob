const Member = require("../models/Member");
const mongoose = require("mongoose");

exports.getNearbyUsers = async (req, res) => {
  try {
    const { latitude, longitude, interests, userId } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({ message: "Location is required" });
    }

    // Update the user's live location
    const test = await updateUserLocation(userId, latitude, longitude);
    if (!test) {
      return res
        .status(500)
        .json({ message: "Failed to update user location" });
    }
    console.log(test.name);

    // Ensure interests is an array
    const interestsArray = Array.isArray(interests) ? interests : [interests];

    const nearbyUsers = await Member.aggregate([
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [parseFloat(longitude), parseFloat(latitude)],
          },
          distanceField: "distance",
          maxDistance: 50000, // 50 km
          spherical: true,
        },
      },
      {
        $match: {
          skills: { $in: interestsArray },
          friends: { $nin: [new mongoose.Types.ObjectId(userId)] }, // Exclude friends
        },
      },
      {
        $project: {
          name: 1,
          location: 1,
          skills: 1,
          profilePicture: 1,
        },
      },
    ]);

    res.status(200).json(nearbyUsers);
  } catch (error) {
    console.error("Error fetching nearby users:", error);
    res.status(500).json({ message: "Error fetching nearby users" });
  }
};

const updateUserLocation = async (userId, latitude, longitude) => {
  try {
    if (!latitude || !longitude) {
      return null; // Handle missing latitude and longitude
    }

    const updatedUser = await Member.findByIdAndUpdate(
      userId,
      {
        liveLocation: {
          type: "Point",
          coordinates: [parseFloat(longitude), parseFloat(latitude)],
        },
      },
      { new: true } // Return the updated document
    );

    return updatedUser;
  } catch (error) {
    console.error("Error updating location:", error);
    return null; // Handle error in case the update fails
  }
};
