const router = require("express").Router();
const userController = require("../controllers/userController");
const checkRegistration = require("../middlewares/checkRegistration");
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/dp/"); // make sure this directory exists
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname); // Extract file extension
    cb(null, file.fieldname + "-" + uniqueSuffix + ext); // filename with extension
  },
});

const uploadPictures = multer({ storage: storage }).fields([
  { name: "profilePicture", maxCount: 1 },
  { name: "coverPicture", maxCount: 1 },
]);

module.exports = (io, userSocketMap) => {
  router.post("/google-signin", checkRegistration, userController.googleLogin);
  router.get("/fetchUser/:userId/:currentUserId", userController.fetchUser);
  router.get("/fetchUserInfo/:userId", userController.fetchUserInfo);
  router.put("/about/:userId", userController.editAbout);
  router.put("/profile/:userId", uploadPictures, userController.editProfile);

  router.get("/connectionRequests/:userId", userController.fetchFriendRequests);
  router.post(
    "/send-connection-request",
    userController.sendRequest(io, userSocketMap)
  );
  router.get(
    "/fetchMessages/:userId/:recipientId",
    userController.fetchMessages
  );
  router.put("/follow/:followerId/:userId", userController.follow);
  router.post("/acceptFriendRequest", userController.acceptRequest);
  router.post("/declineFriendRequest", userController.declineRequest);
  router.put("/:userId/experience", userController.addExperience);
  router.put("/:userId/education", userController.addEducation);
  router.get("/conversations/:userId", userController.fetchConversations);
  router.put("/interests/:userId", userController.updateInterests);
  router.get("/friends/:userId", userController.fetchFriends);
  router.get("/top-networkers", userController.fetchTopNetworkers);
  router.get(
    "/people-you-may-know/:userId",
    userController.fetchPeopleYouMayKnow
  );
  // router.get('/top-networkers', userController.fetchTopNetworkers)
  // router.delete("/:userId/experience/:experienceId", userController.editProfile);

  return router;
};
