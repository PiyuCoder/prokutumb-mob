const router = require("express").Router();
const otherController = require("../controllers/otherControllers");

router.get("/nearby", otherController.getNearbyUsers);
router.post("/interactions", otherController.prokuInteraction);
router.get("/interactions/:userId", otherController.fetchProkuInteractions);
router.get("/search-people", otherController.searchPeople);
router.get("/recentPosts", otherController.getRecentPosts);
router.get("/notifications/:userId", otherController.getNotifications);
router.post("/notifications/mark-as-read", otherController.markAsRead);

module.exports = router;
