const Member = require("../models/Member");
const axios = require("axios");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

// Function to convert JWK to PEM manually
function convertJWKToPEM(jwk) {
  const publicKey = {
    kty: jwk.kty,
    n: Buffer.from(jwk.n, "base64"),
    e: Buffer.from(jwk.e, "base64"),
  };

  return crypto
    .createPublicKey({
      key: Buffer.concat([
        Buffer.from(
          `-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8A`,
          "utf-8"
        ),
        publicKey.n,
        Buffer.from("AQAB", "utf-8"),
        Buffer.from("\n-----END PUBLIC KEY-----", "utf-8"),
      ]),
      format: "pem",
      type: "spki",
    })
    .export({ type: "spki", format: "pem" });
}

// Function to generate a unique 6-character referral code
const generateReferralCode = async () => {
  let code;
  let exists = true;

  while (exists) {
    code = Math.random().toString(36).substring(2, 8).toUpperCase(); // Example: "A1B2C3"
    exists = await Member.findOne({ referralCode: code }); // Ensure uniqueness
  }

  return code;
};

exports.checkRegistration = async (req, res, next) => {
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
      return res.status(200).json({ isRegistered: false });
    }
  } catch (error) {
    console.error("Error checking registration:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.checkRegistrationWithCode = async (req, res, next) => {
  const { token, code } = req.body;

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
      if (!code) {
        return res
          .status(200)
          .json({ success: false, message: "Invalid referral code." });
      }
      const referredBy = await Member.findOne({ referralCode: code });
      if (!referredBy) {
        return res
          .status(200)
          .json({ success: false, message: "Invalid referral code." });
      }
      const referralCode = await generateReferralCode();
      // Register the new user
      const newUser = new Member({
        name: userInfo.name,
        email: userInfo.email,
        profilePicture: userInfo.picture, // Assuming Google returns profile picture
        googleId: userInfo.sub, // This is the unique Google ID for the user
        referralCode,
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

// Function to verify Apple token
async function verifyAppleToken(idToken, userId) {
  try {
    // Fetch Apple's public keys
    const appleKeysUrl = "https://appleid.apple.com/auth/keys";
    const { data } = await axios.get(appleKeysUrl);

    // Decode JWT Header
    const decodedHeader = jwt.decode(idToken, { complete: true });
    if (!decodedHeader) throw new Error("Invalid Token");

    const { kid, alg } = decodedHeader.header;

    // Find the correct JWK
    const appleKey = data.keys.find((key) => key.kid === kid);
    if (!appleKey) throw new Error("No matching Apple Public Key found");

    // Convert JWK to PEM
    const applePublicKey = convertJWKToPEM(appleKey);

    // Verify JWT using built-in crypto
    const payload = jwt.verify(idToken, applePublicKey, { algorithms: [alg] });

    console.log("✅ Apple Token Verified:", payload);

    // Ensure userId matches Apple's `sub`
    if (payload.sub !== userId) {
      throw new Error("User ID mismatch");
    }

    return {
      success: true,
      userId: payload.sub,
      email: payload.email || null, // Apple provides email only on first login
      name: payload.name || null, // Only on first login
    };
  } catch (error) {
    console.error("❌ Apple Authentication Failed:", error.message);
    return { success: false, error: error.message };
  }
}

// **1. Check if User is Registered**
exports.checkRegistrationApple = async (req, res, next) => {
  const { token, userId } = req.body;

  const appleAuth = await verifyAppleToken(token, userId);
  if (!appleAuth.success) {
    return res.status(401).json({ error: "Invalid Apple authentication" });
  }

  try {
    // Check if user exists in the database
    let user = await Member.findOne({ appleId: userId });

    if (user) {
      // ✅ User exists, generate session token
      req.user = user;
      next();
    } else {
      // ❌ User does not exist, ask for referral code
      return res.json({
        isRegistered: false, 
        message: "New user, referral code required",
      });
    }
  } catch (error) {
    console.error("Database Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// **2. Register New User with Referral Code**
exports.checkRegistrationWithCodeApple = async (req, res,next) => {
  const { token, userId, code } = req.body;

  const appleAuth = await verifyAppleToken(token, userId);
  if (!appleAuth.success) {
    return res.status(401).json({ error: "Invalid Apple authentication" });
  }

  try {
    // Check if user already exists
    let existingUser = await Member.findOne({ appleId: userId });
    if (existingUser) {
      req.user = user;
      next();
    }

     if (!code) {
        return res
          .status(200)
          .json({ success: false, message: "Invalid referral code." });
      }

    const referredBy = await Member.findOne({ referralCode: code });

    if (!referredBy) {
        return res
          .status(200)
          .json({ success: false, message: "Invalid referral code." });
      }

    const referralCode = await generateReferralCode();

    // Create new user
    const newUser = new Member({
      appleId: userId,
      name: appleAuth.name || '',
      email: appleAuth.email || '', // Email might be null if Apple hides it
      referralCode,
    });

    await newUser.save();

    req.user = user;
      next();
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
