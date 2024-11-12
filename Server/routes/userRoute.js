const router = require("express").Router();
const userController = require("../controllers/userController");
const checkRegistration = require("../middlewares/checkRegistration");
const multer = require("multer");

// Configure Multer to store files in the 'uploads' folder
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/dp/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname); // Append a timestamp to the original file name
  },
});

const upload = multer({ storage: storage });

module.exports = (io, userSocketMap) => {
  router.post("/google-signin", checkRegistration, userController.googleLogin);
  router.get("/fetchUser/:userId/:currentUserId", userController.fetchUser);
  router.put("/about/:userId", userController.editAbout);
  router.put(
    "/profile/:userId",
    upload.single("profilePicture"),
    userController.editProfile
  );
  router.get("/connectionRequests/:userId", userController.fetchFriendRequests);
  router.post(
    "/send-connection-request",
    userController.sendRequest(io, userSocketMap)
  );
  router.get(
    "/fetchMessages/:userId/:recipientId",
    userController.fetchMessages
  );
  router.post("/acceptFriendRequest", userController.acceptRequest);
  router.post("/declineFriendRequest", userController.declineRequest);
  router.put("/:userId/experience", userController.addExperience);
  router.get("/conversations/:userId", userController.fetchConversations);
  // router.delete("/:userId/experience/:experienceId", userController.editProfile);

  return router;
};
