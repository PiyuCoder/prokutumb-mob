const Member = require("../models/Member");
const axios = require("axios");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const nodemailer = require("nodemailer");
const ReferralSettings = require("../models/ReferralSettings");
const Otp = require("../models/Otp");

const teamId = process.env.APPLE_TEAM_ID;
const clientId = process.env.APPLE_CLIENT_ID;
const keyId = process.env.APPLE_KEY_ID;
const privateKeyPath = path.join(__dirname, "AuthKey_7HSYXFP5ZW.p8");

// Function to generate Apple Client Secret
function generateAppleClientSecret() {
  const privateKey = fs.readFileSync(privateKeyPath, "utf8");

  return jwt.sign(
    {
      iss: teamId,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 15777000, // Expiry (~6 months)
      aud: "https://appleid.apple.com",
      sub: clientId,
    },
    privateKey,
    {
      algorithm: "ES256",
      keyid: keyId,
    }
  );
}

// Function to exchange authorization code for Apple tokens
async function exchangeAppleCodeForTokens(authCode) {
  const clientSecret = generateAppleClientSecret();

  const tokenUrl = "https://appleid.apple.com/auth/token";
  const params = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    code: authCode,
    grant_type: "authorization_code",
  });

  try {
    const response = await axios.post(tokenUrl, params, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    return response.data; // Contains id_token, access_token, refresh_token
  } catch (error) {
    console.error(
      "Apple Token Exchange Failed:",
      error.response?.data || error.message
    );
    throw new Error("Failed to exchange Apple code for tokens");
  }
}

// Function to convert Apple's JWK to PEM format manually
function convertJWKToPEM(jwk) {
  const base64UrlToBase64 = (base64url) =>
    base64url.replace(/-/g, "+").replace(/_/g, "/");

  const n = Buffer.from(base64UrlToBase64(jwk.n), "base64").toString("base64");
  const e = Buffer.from(base64UrlToBase64(jwk.e), "base64").toString("base64");

  return `-----BEGIN PUBLIC KEY-----\n${Buffer.from(
    `MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8A${n}AQAB`,
    "base64"
  ).toString("utf-8")}\n-----END PUBLIC KEY-----`;
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

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
};

const sendEmail = async (recipient, subject, message) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.zoho.in",
      port: 465,
      secure: true, // Use SSL
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    const mailOptions = {
      from: `"Majlis: OTP" <${process.env.EMAIL}>`,
      to: recipient,
      subject: subject,
      text: message,
      html: `<p>${message}</p>`, // Optional: Supports HTML emails
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${recipient}: ${info.messageId}`);
    return { success: true, message: "Email sent successfully" };
  } catch (error) {
    console.error(`❌ Error sending email: ${error.message}`);
    return { success: false, message: "Failed to send email" };
  }
};

exports.checkEmailRegistration = async (req, res, next) => {
  const { email } = req.body;

  try {
    let user = await Member.findOne({ email });
    if (user) {
      return res.status(200).json({ isRegistered: true });
    } else {
      // const otp = generateOTP();

      // await Otp.deleteOne({ email });

      // // Save new OTP in DB
      // const newOtp = new Otp({ email, otp });
      // await newOtp.save();

      // const message = `Your OTP is: <b>${otp}</b>. It is valid for 10 minutes.`;

      // const result = await sendEmail(email, "Your OTP Code", message);
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

      const settings = await ReferralSettings.findOne();
      const referralLimit = settings ? settings.referralLimit : 6;

      if (referredBy.referralCount >= referralLimit) {
        return res.status(200).json({
          success: false,
          limitReached: true,
          message: "Referral limit reached.",
        });
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
      referredBy.referralCount += 1;
      await referredBy.save();

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
    const decoded = jwt.decode(idToken, { complete: true });

    if (!decoded || decoded.payload.sub !== userId) {
      return { success: false, message: "Invalid Apple ID token" };
    }

    return { success: true, payload: decoded.payload };
  } catch (error) {
    console.error("Apple Token Verification Failed:", error);
    return { success: false, message: "Token verification failed" };
  }
}

// **1. Check if User is Registered**
exports.checkRegistrationApple = async (req, res, next) => {
  const { token, userId } = req.body;
  console.log(req.body);

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
exports.checkRegistrationWithCodeApple = async (req, res, next) => {
  const { token, userId, fullName, email } = req.body;

  console.log("Full name: ", fullName);

  const code = "CODE123";

  try {
    let userInfo;

    if (token) {
      // Direct ID Token verification
      userInfo = await verifyAppleToken(token, userId);
    } else {
      return res
        .status(400)
        .json({ message: "Missing authentication token or auth code" });
    }

    console.log("userInfo: ", userInfo);

    if (!userInfo.success) {
      return res.status(401).json({ error: "Invalid Apple authentication" });
    }

    // Extract user details
    const userEmail = email || userInfo.payload.email || "";
    let existingUser = await Member.findOne({ appleId: userId });

    if (existingUser) {
      req.user = existingUser;
      return next(); // Proceed to login
    }

    // If new user, referral code is mandatory
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

    // Create a new user
    const newUser = new Member({
      appleId: userId,
      name: fullName || userInfo.payload.name || "Apple User",
      email: userEmail,
      referralCode,
    });

    await newUser.save();

    req.user = newUser;
    next();
  } catch (error) {
    console.error("Apple Registration Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
