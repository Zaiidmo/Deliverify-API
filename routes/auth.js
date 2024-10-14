const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const {register, login,verifyOtp, logout, requestPasswordReset, resetPassword} = require('../controllers/authController');

//Registration Route 
router.post('/register', register);

// Login Route
router.post('/login', login);

// Verify OTP Route
router.post('/verify-otp', verifyOtp);

// Logout Route
router.post('/logout', authMiddleware, logout);

// Reset Password Route
router.post('/request-password-reset', requestPasswordReset);

// Request Password Reset Route
router.post('/reset-password', resetPassword);

module.exports = router;