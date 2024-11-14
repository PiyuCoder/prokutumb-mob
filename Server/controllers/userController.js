const jwt = require("jsonwebtoken"); // Import JWT for token generation
const Member = require("../models/Member");
const path = require("path");
const fs = require("fs");
const Message = require("../models/Message");
const mongoose = require("mongoose");

exports.googleLogin = (req, res) => {
  const user = req.user;

  // Generate a token for the user
  const token = jwt.sign(
    { userId: user._id, email: user.email },
    process.env.JWT_SECRET, // Replace with your secret key
    { expiresIn: "1h" }
  );

  // Send back token and user info
  res.status(200).json({
    message: "Login successful!",
    token: token,
    user: {
      _id: user._id,
      email: user.email,
      name: user.name,
      profilePicture: user.profilePicture, // Profile picture from Google
      experience: user.experience,
      about: user.bio,
      location: user.location,
      friends: user.friends,
      friendRequests: user.friendRequests,
    },
  });
};

exports.fetchUser = async (req, res) => {
  try {
    const { userId, currentUserId } = req.params;

    console.log(userId);

    const user = await Member.findById(userId);

    if (!user) {
      res.status(400).json({ message: "user not found." });
    }

    const isAlreadyConnected = user.friends.some(
      (friend) => friend._id.toString() === currentUserId.toString()
    );

    const whyConnect = ["Mutual Interests", "Location", "Education"];

    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        profilePicture: user.profilePicture,
        experience: user.experience,
        about: user.bio,
        location: user.location,
        friendRequests: user.friendRequests,
        whyConnect,
        isAlreadyConnected,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error while fetching user" });
  }
};

exports.editAbout = async (req, res) => {
  try {
    const { about } = req.body; // Get the updated "About" text from the request body
    const { userId } = req.params; // Get the userId from the route parameters

    // Find the user by ID and update their "about" field
    const user = await Member.findByIdAndUpdate(
      userId,
      { bio: about }, // Update the "about" field with the new text
      { new: true, runValidators: true } // Return the updated user and run validations
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "About section updated successfully",
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        profilePicture: user.profilePicture,
        experience: user.experience,
        about: user.bio,
        location: user.location,
        friends: user.friends,
        friendRequests: user.friendRequests,
      },
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "An error occurred while updating the About section" });
  }
};

exports.editProfile = async (req, res) => {
  try {
    console.log(req.body);
    const { userId, location, name } = req.body;

    // Find the user in the database
    const user = await Member.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Handle profile picture update if a new file is uploaded
    if (req.file) {
      // Construct the new profile picture URL
      const newProfilePicture = `http://${req.get("host")}/uploads/dp/${
        req.file.filename
      }`;

      // Delete the old profile picture from the server if it exists
      if (user.profilePicture && user.profilePicture.includes("/uploads/dp/")) {
        const oldFilePath = path.join(
          __dirname,
          "../uploads/dp/",
          path.basename(user.profilePicture)
        );
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath); // Delete the old file
        }
      }

      // Update the user's profile picture
      user.profilePicture = newProfilePicture;
    }

    // Update the location
    user.location = location;
    user.name = name;

    // Save the updated user data
    await user.save();

    res.status(200).json({
      message: "Profile section updated successfully",
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        profilePicture: user.profilePicture, // Updated profile picture
        experience: user.experience,
        about: user.bio,
        location: user.location,
        friends: user.friends,
        friendRequests: user.friendRequests,
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "An error occurred while updating the Profile section",
    });
  }
};

exports.addExperience = async (req, res) => {
  try {
    const { experience } = req.body; // Extract the experience from the request body
    const { userId } = req.params; // Extract userId from the request params

    // Find the user by userId and push the new experience into their experience array
    const updatedUser = await Member.findByIdAndUpdate(
      userId,
      { $push: { experience: experience } }, // Add the new experience
      { new: true } // Return the updated user document
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Experience added successfully",
      user: {
        _id: updatedUser._id,
        email: updatedUser.email,
        name: updatedUser.name,
        profilePicture: updatedUser.profilePicture, // Profile picture from Google
        experience: updatedUser.experience,
        about: updatedUser.bio,
        location: updatedUser.location,
        friends: updatedUser.friends,
        friendRequests: updatedUser.friendRequests,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
};

exports.sendRequest = (io, userSocketMap) => async (req, res) => {
  try {
    const { senderId, receiverId } = req.body;
    console.log("working sendReq");

    const receiver = await Member.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ error: "Receiver not found" });
    }

    // Add request to receiver's connection requests
    receiver.friendRequests.push({ fromUser: senderId });
    await receiver.save();

    // Emit a socket event to the receiver if they are online
    const receiverSocketId = userSocketMap[receiverId];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newConnectionRequest", {
        message: "You have a new connection request.",
        fromUserId: senderId,
      });
    }

    res.status(200).json({ message: "Connection request sent successfully." });
  } catch (error) {
    console.error("Error sending connection request:", error);
    res.status(500).json({ message: "Server error while sending request." });
  }
};

exports.acceptRequest = async (req, res) => {
  const { fromUserId, toUserId } = req.body;

  try {
    // Add each user to the other's friends list
    await Member.findByIdAndUpdate(toUserId, {
      $push: {
        friends: {
          _id: fromUserId,
          addedAt: new Date(),
        },
      },
      $pull: { friendRequests: { fromUser: fromUserId } },
    });

    await Member.findByIdAndUpdate(fromUserId, {
      $push: {
        friends: {
          _id: toUserId,
          addedAt: new Date(),
        },
      },
    });

    res
      .status(200)
      .json({ success: true, message: "Friend request accepted." });
  } catch (error) {
    console.error("Error accepting friend request:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to accept friend request." });
  }
};

exports.declineRequest = async (req, res) => {
  const { fromUserId, toUserId } = req.body;

  try {
    await Member.findByIdAndUpdate(toUserId, {
      $pull: { friendRequests: { fromUser: fromUserId } },
    });

    res
      .status(200)
      .json({ success: true, message: "Friend request declined." });
  } catch (error) {
    console.error("Error declining friend request:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to decline friend request." });
  }
};
exports.fetchFriendRequests = async (req, res) => {
  try {
    const { userId } = req.params;

    // console.log(userId);

    // Find the user and populate their friend requests
    const populatedUser = await Member.findById(userId).populate(
      "friendRequests.fromUser",
      "name profilePicture designation"
    );

    const user = await Member.findById(userId);

    if (!populatedUser) {
      return res.status(404).json({ message: "User not found." });
    }

    console.log("Fetching requests");
    // console.log(user);
    // Extract the relevant friend requests details
    const requests = populatedUser.friendRequests.map((request) => ({
      _id: request.fromUser._id,
      name: request.fromUser.name,
      profilePicture: request.fromUser.profilePicture,
      designation: request.fromUser.designation,
      requestedAt: request.requestedAt,
    }));

    // console.log(requests);

    res.status(200).json({ success: true, requests, user });
  } catch (error) {
    console.error("Error fetching friend requests:", error);
    res
      .status(500)
      .json({ message: "Server error while fetching friend requests." });
  }
};

exports.fetchMessages = async (req, res) => {
  const { userId, recipientId } = req.params;

  try {
    // Fetch messages where the current user is either the sender or the recipient, and vice versa
    const messages = await Message.find({
      $or: [
        { sender: userId, recipient: recipientId },
        { sender: recipientId, recipient: userId },
      ],
    }).sort({ timestamp: 1 }); // Sort by timestamp for chronological order

    res.status(200).json({
      success: true,
      messages,
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching messages.",
    });
  }
};

exports.fetchConversations = async (req, res) => {
  const { userId } = req.params;

  try {
    // Fetch latest message per conversation (either as sender or recipient)
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: new mongoose.Types.ObjectId(userId) },
            { recipient: new mongoose.Types.ObjectId(userId) },
          ],
        },
      },
      {
        $sort: { timestamp: -1 },
      },
      {
        $group: {
          _id: {
            $cond: [
              { $gt: ["$sender", "$recipient"] },
              ["$sender", "$recipient"],
              ["$recipient", "$sender"],
            ],
          },
          latestMessage: { $first: "$$ROOT" },
        },
      },
      {
        $lookup: {
          from: "members",
          localField: "latestMessage.sender",
          foreignField: "_id",
          as: "senderDetails",
        },
      },
      {
        $lookup: {
          from: "members",
          localField: "latestMessage.recipient",
          foreignField: "_id",
          as: "recipientDetails",
        },
      },
      {
        $project: {
          _id: 0,
          message: "$latestMessage",
          senderDetails: { $arrayElemAt: ["$senderDetails", 0] },
          recipientDetails: { $arrayElemAt: ["$recipientDetails", 0] },
        },
      },
    ]);

    // Fetch frequently contacted users based on message frequency
    const frequentContacts = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: new mongoose.Types.ObjectId(userId) },
            { recipient: new mongoose.Types.ObjectId(userId) },
          ],
        },
      },
      {
        $group: {
          _id: {
            contact: {
              $cond: {
                if: { $eq: ["$sender", new mongoose.Types.ObjectId(userId)] },
                then: "$recipient",
                else: "$sender",
              },
            },
          },
          lastContacted: { $max: "$timestamp" },
          messageCount: { $sum: 1 },
        },
      },
      {
        $sort: { messageCount: -1, lastContacted: -1 }, // Sort by most frequent and recent
      },
      {
        $limit: 10, // Limit the results
      },
      {
        $lookup: {
          from: "members",
          localField: "_id.contact",
          foreignField: "_id",
          as: "contactInfo",
        },
      },
      {
        $unwind: "$contactInfo",
      },
      {
        $project: {
          _id: "$contactInfo._id",
          name: "$contactInfo.name",
          profilePicture: "$contactInfo.profilePicture",
          lastContacted: "$lastContacted",
          messageCount: "$messageCount",
        },
      },
    ]);

    res.status(200).json({
      success: true,
      conversations,
      frequentContacts,
    });
  } catch (error) {
    console.error("Error fetching conversations and frequent contacts:", error);
    res.status(500).json({ success: false, message: "Failed to fetch data." });
  }
};

exports.fetchTopNetworkers = async (req, res) => {
  try {
    // Filter friends added in the last week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const topNetworkers = await Member.aggregate([
      { $match: { "friends.dateAdded": { $gte: oneWeekAgo } } },
      {
        $project: {
          name: 1,
          profilePicture: 1,
          friends: 1,
          friendCount: { $size: "$friends" },
        },
      },
      { $sort: { friendCount: -1 } },
      { $limit: 10 },
    ]);

    res.json(topNetworkers);
  } catch (error) {
    console.error("Error fetching top networkers:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.fetchPeopleYouMayKnow = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.params.userId);
    const user = await Member.findById(userId).populate("friends", "_id");

    // Get IDs of user's friends
    const friendIds = user.friends.map((friend) => friend._id);

    // Find people with mutual friends and shared interests
    const peopleYouMayKnow = await Member.aggregate([
      {
        $match: {
          _id: { $nin: [...friendIds, userId] },
          interests: { $in: user.interests },
        },
      },
      {
        $project: {
          name: 1,
          profilePicture: 1,
          commonInterests: {
            $size: { $setIntersection: ["$interests", user.interests] },
          },
          mutualFriends: {
            $size: { $setIntersection: ["$friends", friendIds] },
          },
        },
      },
      { $match: { mutualFriends: { $gt: 0 }, commonInterests: { $gt: 0 } } },
      { $sort: { mutualFriends: -1, commonInterests: -1 } },
      { $limit: 10 },
    ]);

    res.json(peopleYouMayKnow);
  } catch (error) {
    console.error("Error fetching people you may know:", error);
    res.status(500).json({ message: "Server error" });
  }
};
