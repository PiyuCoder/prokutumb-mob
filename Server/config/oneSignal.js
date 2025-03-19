const axios = require("axios");

// OneSignal Push Notification Function
const sendPushNotification = async (
  receiverId,
  senderId,
  title,
  message,
  type,
  screen
) => {
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

module.exports = sendPushNotification;
