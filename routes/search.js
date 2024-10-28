const express = require("express");
const router = express.Router();

const { search } = require("../controllers/searchController");

// Search route
router.post("/", search);

module.exports = router;
