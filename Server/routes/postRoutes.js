const router = require("express").Router();
const multer = require("multer");
const postController = require("../controllers/postController");

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/", upload.single("media"), postController.createPost);
router.get("/", postController.fetchPosts);

module.exports = router;
