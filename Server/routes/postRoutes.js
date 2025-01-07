const router = require("express").Router();
const multer = require("multer");
const postController = require("../controllers/postController");

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/", upload.single("media"), postController.createPost);
router.put("/:postId", upload.single("media"), postController.editPost);
router.delete("/:postId", postController.deletePost);
router.get("/:userId", postController.fetchPosts);
router.get("/fetch/:id", postController.fetchPost);
router.put("/like/:postId", postController.likePost);
router.put("/view/:postId", postController.incrementPostView);
router.put("/share/:postId", postController.incerementPostShare);
router.post("/comment/:postId", postController.addComment);

module.exports = router;
