const jwt = require("jsonwebtoken"); // Import JWT for token generation
const Member = require("../models/Member");
const path = require("path");
const fs = require("fs");
const Message = require("../models/Message");
const mongoose = require("mongoose");
const Feed = require("../models/Feed");
const NotificationMob = require("../models/Notification");
const Communitymob = require("../models/Community");
const Event = require("../models/Event");
const axios = require("axios");
const CommPost = require("../models/CommPost");

exports.googleLogin = (req, res) => {
  const user = req.user;

  // Generate a token for the user
  const token = jwt.sign(
    { userId: user._id, email: user.email },
    process.env.JWT_SECRET, // Replace with your secret key
    { expiresIn: "1h" }
  );

  console.log("google login");
  // Send back token and user info
  res.status(200).json({
    success: true,
    message: "Login successful!",
    token: token,
    user,
  });
};
exports.appleLogin = (req, res) => {
  try {
    const user = req.user;
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET, // Replace with your secret key
      { expiresIn: "1h" }
    );

    // Send back token and user info
    res.status(200).json({
      success: true,
      message: "Apple Login successful!",
      token: token,
      user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.fetchUserData = async (req, res) => {
  const { userId } = req.params;
  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: "Invalid or missing userId" });
  }
  const user = await Member.findById(userId);
  if (!user) {
    return res.status(400).json({ message: "User not found." });
  }
  // Send back token and user info
  res.status(200).json({
    user,
  });
};

exports.fetchUserInfo = async (req, res) => {
  try {
    const { userId } = req.params;

    console.log(userId);

    // Fetch user details
    const user = await Member.findById(userId);

    if (!user) {
      return res.status(400).json({ message: "User not found." });
    }

    // Count communities where the user is the creator
    const createdCommunitiesCount = await Communitymob.countDocuments({
      createdBy: userId,
      isDraft: false,
    });

    // Count communities where the user is a member
    const memberCommunitiesCount = await Communitymob.countDocuments({
      members: { $in: [userId] },
      isDraft: false,
    });

    // Combine counts for total communities associated with the user
    const totalCommunities = createdCommunitiesCount + memberCommunitiesCount;

    // Return user details along with community association info
    res.status(200).json({
      success: true,
      info: {
        education: user.education,
        communities: {
          createdCount: createdCommunitiesCount,
          memberCount: memberCommunitiesCount,
          total: totalCommunities,
        },
      },
    });
  } catch (error) {
    console.error("Server error while fetching user:", error.message);
    res.status(500).json({ message: "Server error while fetching user" });
  }
};

function getRandomScore() {
  return Math.floor(Math.random() * (100 - 50 + 1)) + 50;
}

async function getSimilarityScore(user, currentUser) {
  try {
    console.log(user.name, currentUser.name);
    // Create strings for AI API
    const profile2 = `${user.bio} located in ${
      user.location
    } whose interests are ${
      user.interests?.join(", ") || ""
    } and have skills like ${user.skills?.join(", ") || ""}`;
    const profile1 = `${currentUser.bio} located in ${
      currentUser.location
    } whose interests are ${
      currentUser.interests?.join(", ") || ""
    } and have skills like ${currentUser.skills?.join(", ") || ""}`;

    console.log("Profile 1:", profile1);
    console.log("Profile 2:", profile2);

    // Send request to AI similarity API
    const apiResponse = await axios.post(
      "https://majlisserver.com/app2/similarity",
      {
        type: "profile", // Assuming this defines the type of similarity check
        profile1, // User profile details
        profile2, // Current user profile details
      }
    );

    console.log("API Response:", apiResponse.data);

    // Extract AI similarity response
    return apiResponse.data.similarity_score || 0;
  } catch (error) {
    console.error("Error fetching similarity score:", error);
    return 0; // Return a default value in case of error
  }
}

exports.fetchUser = async (req, res) => {
  try {
    const { userId, currentUserId } = req.params;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid or missing userId" });
    }

    // Fetch user details
    const user = await Member.findById(userId);
    const currentUser = await Member.findById(currentUserId);

    if (!user) {
      return res.status(400).json({ message: "User not found." });
    }

    // Count communities where the user is the creator
    const createdCommunitiesCount = await Communitymob.countDocuments({
      createdBy: userId,
      isDraft: false,
    });

    // Count communities where the user is a member
    const memberCommunitiesCount = await Communitymob.countDocuments({
      members: { $in: [userId] },
      isDraft: false,
    });

    // Check if the current user is already connected
    const isAlreadyConnected = user.friends.some(
      (friend) => friend._id.toString() === currentUserId.toString()
    );

    // Fetch user's posts
    const posts = await Feed.find({ user: userId })
      .populate("user", "name profilePicture") // Populate post creator
      .populate({
        path: "comments.user", // Populate comment user
        select: "name profilePicture", // Include name and profilePicture
      })
      .sort({ createdAt: -1 })
      .lean(); // Convert MongoDB documents to plain JavaScript objects

    // Extract AI similarity response
    const similarityScore = await getSimilarityScore(user, currentUser);

    // Combine counts for total communities associated with the user
    const totalCommunities = createdCommunitiesCount + memberCommunitiesCount;
    // Return user details and posts
    res.status(200).json({
      success: true,
      user,
      posts,
      isAlreadyConnected,
      similarityScore,
      socialAvgScore: getRandomScore(),
      communities: {
        createdCount: createdCommunitiesCount,
        memberCount: memberCommunitiesCount,
        total: totalCommunities,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error while fetching user" });
  }
};

exports.getUserCommunitiesAndEvents = async (req, res) => {
  try {
    const { userId } = req.params;

    console.log("gettimng user communities and events", userId);

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Fetch communities where the user is the creator
    const communities = await Communitymob.find({
      createdBy: userId,
      isDraft: false,
    }).populate("createdBy", "name profilePicture");

    // Extract community IDs
    const communityIds = communities.map((community) => community._id);
    let events = [];
    if (communities.length) {
      // Fetch events associated with those communities
      events = await Event.find({
        community: { $in: communityIds },
        isDraft: false,
      });
    }

    res.status(200).json({
      message: "Communities and events fetched successfully",
      communities,
      events,
    });
  } catch (error) {
    console.error("Error fetching communities and events:", error);
    res.status(500).json({ message: "Internal Server Error" });
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
      user,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "An error occurred while updating the About section" });
  }
};

exports.createProfile = async (req, res) => {
  try {
    const {
      userId,
      name,
      interests,
      about,
      skills,
      experience,
      education,
      socialLinks,
      location,
    } = req.body;

    console.log({
      userId,
      name,
      interests,
      about,
      skills,
      experience,
      education,
      socialLinks,
      location,
    });

    let profilePicture;
    if (req.file) {
      profilePicture = `https://${req.get("host")}/uploads/dp/${
        req.file.filename
      }`;
    }

    const user = await Member.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.name = name;
    user.profilePicture = profilePicture;
    user.interests = JSON.parse(interests);
    user.bio = about;
    user.location = location;
    user.skills = JSON.parse(skills);
    user.experience = JSON.parse(experience);
    user.education = JSON.parse(education);
    user.socialLinks = JSON.parse(socialLinks);
    user.isProfileComplete = true;

    await user.save();

    res.status(200).json({
      message: "Profile created successfully",
      user,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "An error occurred while creating the profile" });
  }
};

exports.editProfile = async (req, res) => {
  try {
    const { userId, location, name, dob } = req.body;

    // console.log(name, dob);
    // Find the user in the database
    const user = await Member.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // console.log(req.files?.profilePicture, req.files?.coverPicture);
    // Handle Profile Picture Update
    if (req.files?.profilePicture) {
      const newProfilePicture = `https://${req.get("host")}/uploads/dp/${
        req.files.profilePicture[0].filename
      }`;

      // Delete the old profile picture
      if (user.profilePicture?.includes("/uploads/dp/")) {
        const oldFilePath = path.join(
          __dirname,
          "../uploads/dp/",
          path.basename(user.profilePicture)
        );
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }

      user.profilePicture = newProfilePicture;
    }

    // Handle Cover Picture Update
    if (req.files?.coverPicture) {
      const newCoverPicture = `https://${req.get("host")}/uploads/dp/${
        req.files.coverPicture[0].filename
      }`;

      // Delete the old cover picture
      if (user.coverPicture?.includes("/uploads/dp/")) {
        const oldCoverPath = path.join(
          __dirname,
          "../uploads/dp/",
          path.basename(user.coverPicture)
        );
        if (fs.existsSync(oldCoverPath)) {
          fs.unlinkSync(oldCoverPath);
        }
      }

      user.coverPicture = newCoverPicture;
    }

    // Update other fields
    user.location = location;
    user.name = name;
    user.dob = dob;

    // Save the updated user data
    await user.save();

    // console.log(user);

    res.status(200).json({
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "An error occurred while updating the profile" });
  }
};

exports.addEducation = async (req, res) => {
  try {
    const { education } = req.body; // Extract the experience from the request body
    const { userId } = req.params; // Extract userId from the request params

    console.log("adding education");

    // Find the user by userId and push the new experience into their experience array
    const updatedUser = await Member.findByIdAndUpdate(
      userId,
      { $push: { education: education } }, // Add the new experience
      { new: true } // Return the updated user document
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Education added successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
};
exports.addExperience = async (req, res) => {
  try {
    const { experience } = req.body; // Extract the experience from the request body
    const { userId } = req.params; // Extract userId from the request params

    console.log("updated experirience");

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
      user: updatedUser,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
};

exports.editExperience = async (req, res) => {
  try {
    const { userId, expId } = req.params;
    const { experience } = req.body;

    console.log("edited exp");

    // Validate that the experience ID exists in the user's experience list
    const user = await Member.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find the experience by ID and make sure the experience belongs to this user
    const expIndex = user.experience.findIndex(
      (exp) => exp._id.toString() === expId
    );
    if (expIndex === -1) {
      return res.status(404).json({ message: "Experience not found" });
    }

    // Update the experience at the found index
    user.experience[expIndex] = {
      ...user.experience[expIndex].toObject(),
      ...experience, // Update the fields with the new data
    };

    // Save the updated user
    await user.save();

    return res.status(200).json({
      message: "Experience updated successfully",
      user,
    });
  } catch (error) {
    console.error("Error updating experience:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

exports.editEdu = async (req, res) => {
  try {
    const { userId, eduId } = req.params;
    const { education } = req.body;

    console.log("edited edu");

    // Validate that the experience ID exists in the user's experience list
    const user = await Member.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find the experience by ID and make sure the experience belongs to this user
    const eduIndex = user.education.findIndex(
      (edu) => edu._id.toString() === eduId
    );
    if (eduIndex === -1) {
      return res.status(404).json({ message: "Experience not found" });
    }

    // Update the experience at the found index
    user.education[eduIndex] = {
      ...user.education[eduIndex].toObject(),
      ...education, // Update the fields with the new data
    };

    // Save the updated user
    await user.save();

    return res.status(200).json({
      message: "Experience updated successfully",
      user,
    });
  } catch (error) {
    console.error("Error updating experience:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
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

    // Create a notification for the receiver
    const notification = new NotificationMob({
      recipientId: receiverId,
      senderId: senderId,
      message: "You have a new connection request.",
      type: "connection request",
    });
    await notification.save();

    // Emit a socket event to the receiver if they are online
    const receiverSocketId = userSocketMap[receiverId];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newConnectionRequest", {
        message: "You have a new connection request.",
        fromUserId: senderId,
      });
      console.log(
        `Sent notification to ${receiverId} about the new connection request.`
      );
    }

    res.status(200).json({ message: "Connection request sent successfully." });
  } catch (error) {
    console.error("Error sending connection request:", error);
    res.status(500).json({ message: "Server error while sending request." });
  }
};

exports.follow = async (req, res) => {
  try {
    const { followerId, userId } = req.params;

    // Validate follower
    const follower = await Member.findById(followerId);
    if (!follower) {
      return res.status(400).json({ message: "Follower not found." });
    }

    // Validate user to follow
    const userToFollow = await Member.findById(userId);
    if (!userToFollow) {
      return res.status(400).json({ message: "User to follow not found." });
    }

    // Prevent duplicate following
    if (!follower.following.includes(userId)) {
      follower.following.push(userId);
      await follower.save();
    } else {
      return res.status(400).json({ message: "Already following this user." });
    }

    // Respond with updated user info
    res.status(200).json({
      message: "Following",
      user: follower,
    });
  } catch (error) {
    console.error("Follow API error:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.acceptRequest = async (req, res) => {
  const { fromUserId, toUserId } = req.body;

  try {
    // Fetch both users concurrently
    const [toUser, fromUser] = await Promise.all([
      Member.findById(toUserId),
      Member.findById(fromUserId),
    ]);

    if (!toUser || !fromUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    // Check if they are already friends
    const isAlreadyFriend = toUser.friends.some(
      (friend) => friend._id.toString() === fromUserId
    );

    if (isAlreadyFriend) {
      return res
        .status(400)
        .json({ success: false, message: "Users are already friends." });
    }

    // Accept the friend request
    await Promise.all([
      Member.findByIdAndUpdate(toUserId, {
        $push: {
          friends: {
            _id: fromUserId,
            addedAt: new Date(),
          },
        },
        $pull: { friendRequests: { fromUser: fromUserId } },
      }),
      Member.findByIdAndUpdate(fromUserId, {
        $push: {
          friends: {
            _id: toUserId,
            addedAt: new Date(),
          },
        },
      }),
    ]);

    // Send the updated user data as part of the response
    const updatedUser = await Member.findById(toUserId);
    res.status(200).json({
      success: true,
      message: "Friend request accepted.",
      user: updatedUser,
    });
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
    // Pull the declined request from the toUser's friendRequests
    await Member.findByIdAndUpdate(toUserId, {
      $pull: { friendRequests: { fromUser: fromUserId } },
    });

    const updatedUser = await Member.findById(toUserId);

    res.status(200).json({
      success: true,
      message: "Friend request declined.",
      user: updatedUser,
    });
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

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid userId format" });
    }

    // Fetch user along with friend requests
    const populatedUser = await Member.findById(userId)
      .populate(
        "friendRequests.fromUser",
        "name profilePicture designation friends"
      )
      .populate("friends", "_id");

    if (!populatedUser) {
      return res.status(404).json({ message: "User not found." });
    }

    const userFriendIds = new Set(
      populatedUser.friends.map((friend) => friend._id.toString())
    );

    // Process each friend request and compute mutual friends
    const requests = populatedUser.friendRequests.map((request) => {
      const fromUser = request.fromUser;

      // Find mutual friends (intersection of both friend lists)
      const fromUserFriendIds = new Set(
        fromUser.friends.map((friend) => friend.toString())
      );
      const mutualFriends = [...userFriendIds].filter((id) =>
        fromUserFriendIds.has(id)
      );

      return {
        _id: fromUser._id,
        name: fromUser.name,
        profilePicture: fromUser.profilePicture,
        designation: fromUser.designation,
        requestedAt: request.requestedAt,
        mutualFriendsCount: mutualFriends.length,
        mutualFriends: mutualFriends.slice(0, 3), // Limit to 3 mutual friends for preview
      };
    });

    res.status(200).json({ success: true, requests });
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
    })
      .sort({ timestamp: 1 })
      .populate("replyTo"); // Sort by timestamp for chronological order

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
    console.log("testing: ", userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get the list of users who have sent a friend request to the logged-in user
    const friendRequestSenders = user.friendRequests.map(
      (request) => request.fromUser._id
    );
    // Get the list of friend IDs
    const friendIds = user.friends.map((friend) => friend._id);

    // Find people with shared interests, excluding friends
    let peopleYouMayKnow = await Member.aggregate([
      {
        $match: {
          _id: { $nin: [...friendIds, userId, ...friendRequestSenders] }, // Exclude friends and self
          interests: { $in: user.interests }, // Match based on shared interests
        },
      },
      {
        $project: {
          name: 1,
          profilePicture: 1,
          commonInterests: {
            $size: { $setIntersection: ["$interests", user.interests] },
          },
          friendRequests: 1,
          location: 1,
          skills: 1,
          interests: 1,
          bio: 1,
        },
      },
      { $match: { commonInterests: { $gt: 0 } } }, // Ensure at least one shared interest
      { $sort: { commonInterests: -1 } }, // Sort by highest shared interests
      { $limit: 10 }, // Limit results to 10 users
    ]);

    // Compute similarity scores for each suggested user
    peopleYouMayKnow = await Promise.all(
      peopleYouMayKnow.map(async (person) => {
        const similarityScore = await getSimilarityScore(person, user);
        return { ...person, similarityScore };
      })
    );

    res.json(peopleYouMayKnow);
  } catch (error) {
    console.error("Error fetching people you may know:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.fetchFriends = async (req, res) => {
  try {
    const { userId } = req.params;

    // Fetch the user document with the given userId
    const user = await Member.findById(userId).populate({
      path: "friends",
      select: "name profilePicture location email", // Populate friends with name, profilePicture, etc.
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    console.log(user.friends);
    // Return the list of friends
    res.json(user.friends);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.updateInterests = async (req, res) => {
  const { userId } = req.params;
  const { interests } = req.body;

  console.log(interests);

  // Validate input
  if (!Array.isArray(interests)) {
    return res.status(400).json({ message: "Interests must be an array." });
  }

  if (interests.length > 3) {
    return res
      .status(400)
      .json({ message: "You can only select up to 3 interests." });
  }

  try {
    // Find the user by ID and update interests
    const user = await Member.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Update interests
    user.interests = interests;
    await user.save();

    return res.status(200).json({
      message: "Interests updated successfully.",
      user,
    });
  } catch (error) {
    console.error("Error updating interests:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.deleteProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    // 1️⃣ Check if user exists
    const user = await Member.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 2️⃣ Delete all communities created by the user
    await Communitymob.deleteMany({ createdBy: userId });

    // 3️⃣ Remove user from other users' friend requests
    await Member.updateMany(
      { "friendRequests.fromUser": userId },
      { $pull: { friendRequests: { fromUser: userId } } }
    );

    // 4️⃣ Remove user from other users' friend lists
    await Member.updateMany(
      { friends: { $elemMatch: { type: userId } } },
      { $pull: { friends: { type: userId } } }
    );

    // 5️⃣ Delete all feeds posted by the user
    await Feed.deleteMany({ postedBy: userId });

    // 6️⃣ Remove user's comments from all feeds
    await Feed.updateMany(
      { "comments.user": userId }, // Find feeds where the user has commented
      { $pull: { comments: { user: userId } } } // Remove comments where the user is the author
    );

    // 6️⃣ Remove user's comments from all feeds
    await CommPost.updateMany(
      { "comments.user": userId }, // Find feeds where the user has commented
      { $pull: { comments: { user: userId } } } // Remove comments where the user is the author
    );

    // 7️⃣ Delete the user
    await Member.findByIdAndDelete(userId);

    res.status(200).json({ message: "User profile deleted successfully" });
  } catch (error) {
    console.error("Error deleting profile:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
