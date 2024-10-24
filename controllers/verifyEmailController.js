const User = require("../models/User");
const jwtService = require("../services/jwtService");
const mongoose = require("mongoose");

const verifyEmail = async (req, res) => {
  const { token } = req.query;

  try {
    // Verify the token and extract the user ID
    const decoded = jwtService.verifyToken(token);
    // console.log("Decoded token:", decoded); // Log the decoded token

    if (!decoded || !decoded._id || typeof decoded._id !== "string") {
      // console.log("Token is invalid or expired:", decoded); 
      return res
        .status(400)
        .json({ message: "Invalid or expired verification link." });
    }

    const userId = decoded._id; 

    // Check if the user ID is valid
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      // console.log("Invalid user ID:", userId);
      return res.status(400).json({ message: "User not found." });
    }

    // Find the user in the database
    const user = await User.findById(userId);
    if (!user) {
      // console.log("No user found with ID:", userId);
      return res.status(400).json({ message: "User not found." });
    }

    // Check if the user is already verified
    if (user.isVerified) {
      // console.log("User is already verified:", userId);
      return res.status(400).json({ message: "User already verified." });
    }

    // Update user verification status
    user.isVerified = true;
    user.verificationToken = null;
    user.verificationExpiration = null;
    await user.save();

    // Respond with success message
    res.status(200).json({
      message: "Email verified successfully. You can now log in.",
      user,
    });
  } catch (error) {
    // console.error("Verification error:", error);
    res
      .status(500)
      .json({ message: "An error occurred while verifying email." });
  }
};

const checkToken = async (req, res) => {
  const { token } = req.body;

  try {
    const decoded = jwtService.verifyToken(token);
    if (!decoded || !decoded._id) {
      return res.status(400).json({ message: "Invalid or expired token." });
    }

    res.status(200).json({
      message: "Token is valid",
      userId: decoded._id,
    });
  } catch (error) {
    // console.error("Token check error:", error);
    res
      .status(500)
      .json({ message: "An error occurred while checking the token." });
  }
};

module.exports = {
  verifyEmail,
  checkToken,
};
