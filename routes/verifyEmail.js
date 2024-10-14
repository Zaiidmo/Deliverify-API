const express = require("express");
const router = express.Router();
const {
  verifyEmail,
  checkToken,
} = require("../controllers/verifyEmailController");

// Verify email address
router.get("/verify-email", verifyEmail);
// Check if token is valid
router.post("/check-token", checkToken);

module.exports = router;
