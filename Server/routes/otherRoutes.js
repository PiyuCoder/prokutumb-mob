const router = require("express").Router();
const otherController = require("../controllers/otherControllers");

router.get("/nearby", otherController.getNearbyUsers);
router.post("/interactions", otherController.prokuInteraction);
router.get("/interactions/:userId", otherController.fetchProkuInteractions);
router.get("/search-people", otherController.searchPeople);
router.get("/search-community", otherController.searchCommunity);
router.get("/search-event", otherController.searchEvent);
router.get("/recentPosts", otherController.getRecentPosts);
router.get("/notifications/:userId", otherController.getNotifications);
router.post("/notifications/mark-as-read", otherController.markAsRead);
router.post("/waiting-list", otherController.addToWaitingList);
router.post("/update-referral-limit", otherController.updateReferralLimit);

module.exports = router;
