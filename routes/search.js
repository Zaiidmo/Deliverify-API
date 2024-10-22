const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");

const { search } = require("../controllers/searchController");

// Search route
router.get("/", search);

module.exports = router;
