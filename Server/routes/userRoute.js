const router = require("express").Router();
const userController = require("../controllers/userController");
const checkRegistrationController = require("../middlewares/checkRegistration");
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

const dpStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/dp/"); // Folder to store uploaded files
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

const upload = multer({
  storage: dpStorage,
  fileFilter: (req, file, cb) => {
    console.log("Multer test: ", file);
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error("Only images are allowed!"));
    }
  },
});

module.exports = (io, userSocketMap) => {
  router.post(
    "/check-registration",
    checkRegistrationController.checkRegistration
  );
  router.post(
    "/google-signin",
    checkRegistrationController.checkRegistrationWithCode,
    userController.googleLogin
  );
  router.post("/apple-signin", userController.appleLogin);
  router.post(
    "/create-profile",
    upload.single("profilePicture"),
    userController.createProfile
  );
  router.get("/fetchUserData/:userId", userController.fetchUserData);
  router.get("/fetchUser/:userId/:currentUserId", userController.fetchUser);
  router.get("/fetchUserInfo/:userId", userController.fetchUserInfo);
  router.put("/about/:userId", userController.editAbout);
  router.put("/profile/:userId", uploadPictures, userController.editProfile);
  router.get(
    "/:userId/communities-events",
    userController.getUserCommunitiesAndEvents
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
  router.put("/follow/:followerId/:userId", userController.follow);
  router.post("/acceptFriendRequest", userController.acceptRequest);
  router.post("/declineFriendRequest", userController.declineRequest);
  router.put("/:userId/experience", userController.addExperience);
  router.put("/:userId/edit-experience/:expId", userController.editExperience);
  router.put("/:userId/edit-education/:eduId", userController.editEdu);
  router.put("/:userId/education", userController.addEducation);
  router.get("/conversations/:userId", userController.fetchConversations);
  router.put("/interests/:userId", userController.updateInterests);
  router.get("/friends/:userId", userController.fetchFriends);
  router.get("/top-networkers", userController.fetchTopNetworkers);
  router.get(
    "/people-you-may-know/:userId",
    userController.fetchPeopleYouMayKnow
  );
  router.delete("/:userId", userController.deleteProfile);
  // router.get('/top-networkers', userController.fetchTopNetworkers)
  // router.delete("/:userId/experience/:experienceId", userController.editProfile);

  return router;
};
