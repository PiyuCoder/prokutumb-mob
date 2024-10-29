const Member = require("../models/Member");

const checkRegistration = async (req, res, next) => {
  const { token } = req.body;

  try {
    // Fetch user info from Google using the access token
    const response = await fetch(
      `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${token}`
    );
    if (!response.ok) {
      if (response.status === 401) {
        return res
          .status(401)
          .json({ message: "Invalid or expired access token" });
      }
      throw new Error("Failed to fetch user info from Google");
    }

    const userInfo = await response.json();
    const email = userInfo.email;

    // Check if user exists in the database
    let user = await Member.findOne({ email });

    if (user) {
      // User exists, proceed to login
      req.user = user;
      req.userInfo = userInfo; // Optional, in case you need it in the next function
      next(); // Proceed to login
    } else {
      // Register the new user
      const newUser = new Member({
        name: userInfo.name,
        email: userInfo.email,
        profilePicture: userInfo.picture, // Assuming Google returns profile picture
        googleId: userInfo.sub, // This is the unique Google ID for the user
      });

      // Save the new user in the database
      user = await newUser.save();

      // Now that the user is registered, log them in by continuing
      req.user = user;
      req.userInfo = userInfo; // Optional
      next(); // Proceed to login (e.g., generate token)
    }
  } catch (error) {
    console.error("Error checking registration:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = checkRegistration;
