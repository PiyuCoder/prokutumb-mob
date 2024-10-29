const router = require("express").Router();
const otherController = require("../controllers/otherControllers");

router.get("/nearby", otherController.getNearbyUsers);

module.exports = router;
