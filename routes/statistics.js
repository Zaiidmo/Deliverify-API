const express = require("express");
const {getAllStatisticsResto} = require("../controllers/statisticsManagerController");
const authMiddleware = require("../middlewares/authMiddleware");


const router = express.Router();


router.post("/statisticsResto", authMiddleware, getAllStatisticsResto);

module.exports = router;