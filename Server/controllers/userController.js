const jwt = require("jsonwebtoken"); // Import JWT for token generation
const Member = require("../models/Member");
const path = require("path");
const fs = require("fs");

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
    },
  });
};

exports.fetchUser = async (req, res) => {
  try {
    const { userId } = req.params;

    console.log(userId);

    const user = await Member.findById(userId);

    if (!user) {
      res.status(400).json({ message: "user not found." });
    }

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
        whyConnect,
      },
    });
  } catch (error) {
    res.sta(500).json({ message: "Server error while fetching user" });
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

    // Respond with the updated user data
    res.status(200).json({
      message: "About section updated successfully",
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        profilePicture: user.profilePicture, // Profile picture from Google
        experience: user.experience,
        about: user.bio,
        location: user.location,
      },
    });
  } catch (error) {
    console.error(error); // Log the error for debugging

    // Respond with a generic error message
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
      const newProfilePicture = `https://${req.get("host")}/uploads/dp/${
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
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
};
