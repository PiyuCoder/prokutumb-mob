const router = require("express").Router();
const multer = require("multer");
const path = require("path");
const communityController = require("../controllers/communityController");

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Folder to store uploaded files
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

const upload = multer({
  storage: storage,
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

const storagePost = multer.memoryStorage();
const uploadPost = multer({ storagePost });

module.exports = (io, userSocketMap) => {
  router.post(
    "/post",
    uploadPost.single("media"),
    communityController.createPost
  );
  router.put(
    "/:postId",
    uploadPost.single("media"),
    communityController.editPost
  );
  router.put(
    "/join/:communityId",
    communityController.joinCommunity(io, userSocketMap)
  );
  router.post(
    "/events",
    upload.single("profilePicture"),
    communityController.createEvent
  );
  router.get(
    "/events/fetchCommEvents/:communityId",
    communityController.fetchCommEvents
  );
  router.get("/events/fetchAllEvents", communityController.fetchAllEvents);
  router.get("/events/fetchAnEvent/:eventId", communityController.fetchAnEvent);
  router.delete("/:postId", communityController.deletePost);
  router.put("/like/:postId", communityController.likePost);
  router.put("/accept/:communityId", communityController.acceptRequest);
  router.put("/share/:postId", communityController.incerementPostShare);
  router.post("/comment/:postId", communityController.addComment);
  router.get("/", communityController.fetchCommunities);
  router.get("/:communityId", communityController.fetchCommunity);
  router.post(
    "/",
    upload.single("profilePicture"),
    communityController.createCommunity
  );

  return router;
};
