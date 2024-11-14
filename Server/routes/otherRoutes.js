const router = require("express").Router();
const otherController = require("../controllers/otherControllers");

router.get("/nearby", otherController.getNearbyUsers);
router.post("/interactions", otherController.prokuInteraction);
router.get("/interactions/:userId", otherController.fetchProkuInteractions);
router.get("/search-people", otherController.searchPeople);

module.exports = router;
