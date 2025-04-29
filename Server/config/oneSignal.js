const axios = require("axios");

// OneSignal Push Notification Function
const sendPushNotification = async (
  receiverId,
  senderId,
  title,
  message,
  type,
  screen,
  params // Added params argument
) => {
  console.log(receiverId, senderId, title, message, type, screen, params);
  try {
    await axios.post(
      "https://onesignal.com/api/v1/notifications",
      {
        app_id: `${process.env.ONESIGNAL_APP_ID}`,
        include_external_user_ids: [receiverId],
        headings: { en: title },
        contents: { en: message },
        data: {
          type, // Notification type (friend_request, message, community_join_request)
          sender_id: senderId,
          screen, // Screen to navigate on notification click
          params, // Pass additional parameters (userId, name, profilePicture, etc.)
        },
      },
      {
        headers: {
          Authorization: `Basic ${process.env.ONESIGNAL_REST_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log(`✅ Push notification sent to user: ${receiverId}`);
  } catch (error) {
    console.error(
      "❌ Error sending push notification:",
      error.response?.data || error.message
    );
  }
};

const sendEmail = async (toEmail, subject, htmlContent) => {
  try {
    const response = await axios.post(
      "https://onesignal.com/api/v1/notifications",
      {
        app_id: process.env.ONESIGNAL_APP_ID,
        include_email_tokens: [toEmail],
        include_aliases: {
          email: [toEmail],
        },
        email_subject: subject,
        email_body: htmlContent,
        email_from_name: "Majlis",
        email_from_address: "no-reply@majlis.network",
      },
      {
        headers: {
          Authorization: `Basic ${process.env.ONESIGNAL_REST_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ Email sent:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "❌ Error sending email:",
      error.response?.data || error.message
    );
    throw error;
  }
};

const sendOtpEmail = async (email, otp) => {
  try {
    console.log("📨 Sending OTP...");
    const response = await axios.post(
      "https://onesignal.com/api/v1/notifications",
      {
        app_id: process.env.ONESIGNAL_APP_ID,
        include_email_tokens: [email], // ✅ This triggers Email Subscription creation
        email_subject: "Your OTP Code",
        template_id: process.env.ONESIGNAL_OTP_TEMPLATE_ID,
        email_from_name: "Majlis",
        email_from_address: "no-reply@majlis.network",
        email_reply_to_address: "support@majlis.network",
        custom_data: {
          otp: otp,
          name: email.split("@")[0], // Extracting username from email
        },
      },
      {
        headers: {
          Authorization: `Basic ${process.env.ONESIGNAL_REST_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ OTP Email sent:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "❌ Failed to send OTP email:",
      error.response?.data || error.message
    );
    throw error;
  }
};

const registerEmail = async (email) => {
  try {
    const response = await axios.post(
      "https://onesignal.com/api/v1/players",
      {
        app_id: process.env.ONESIGNAL_APP_ID,
        device_type: 11, // 11 = Email
        identifier: email,
      },
      {
        headers: {
          Authorization: `Basic ${process.env.ONESIGNAL_REST_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ Email subscription created:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "❌ Failed to register email:",
      error.response?.data || error.message
    );
    throw error;
  }
};

module.exports = {
  sendPushNotification,
  sendEmail,
  sendOtpEmail,
  registerEmail,
};
