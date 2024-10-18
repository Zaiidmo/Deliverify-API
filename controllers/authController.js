const jwtService = require("../services/jwtService");
const passwordService = require("../services/passwordService");
const mailService = require("../services/mailService");
const otpService = require("../services/otpService");
const User = require("../models/User");
const Role = require("../models/Role");
const { validateRegistration } = require("../validations/authValidations");
const deviceService = require("../services/deviceService");

// Helper function to find existing user by fields
const findExistingUser = async (username, email, phoneNumber) => {
  return await User.findOne({
    $or: [{ username }, { email }, { phoneNumber }],
  });
};

const findUserByIdentifier = async (identifier) => {
  return await User.findOne({
    $or: [
      { username: identifier },
      { email: identifier },
      { phoneNumber: identifier },
    ],
  });
};
// Register a new user
const register = async (req, res) => {
  try {
    // console.log("Received registration request with body:", req.body);

    const {
      fullname,
      username,
      email,
      CIN,
      phoneNumber,
      password,
      roles: roleNames,
    } = req.body;

    // Validate user input
    const { isValid, message } = validateRegistration(req.body);
    if (!isValid) {
      // console.log("Validation failed:", message);
      return res.status(400).json({ message });
    }

    // Check if user already exists
    const existingUser = await findExistingUser(username, email, phoneNumber);
    if (existingUser) {
      // console.log("User already exists:", existingUser);
      return res
        .status(400)
        .json({ message: "Username, Email, or Phone Number already exists." });
    }

    // Set user roles
    let roles = await Role.find({ name: { $in: roleNames } });
    if (roles.length === 0) {
      // console.log("Invalid roles provided:", roleNames);
      return res.status(400).json({ message: "Invalid role(s) provided." });
    }

    // Check for admin role in registration
    if (roles.some((role) => role.name.toLowerCase() === "admin")) {
      // console.log('Attempted to register with "admin" role');
      return res
        .status(400)
        .json({ message: 'Role "admin" is not allowed for registration.' });
    }

    hashedPassword = await passwordService.hashPassword(password);
    // Create a new user
    const newUser = new User({
      fullname,
      username,
      email,
      CIN,
      phoneNumber,
      password: hashedPassword,
      roles: roles.map((role) => role._id),
      isVerified: false,
    });

    await newUser.save();

    const verificationToken = jwtService.generateVerificationToken(newUser._id);
    console.log("Sending verification email to:", email);
    await mailService.sendVerificationEmail(
      fullname.fname,
      email,
      verificationToken
    );

    res.status(201).json({
      message: "User registered successfully. Please verify your email.",
      user: {
        fullname,
        username,
        email,
        CIN,
        phoneNumber,
        roles: newUser.roles,
      },
      token: verificationToken,
    });
  } catch (err) {
    // console.error("Error during registration:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Login an existing user Step 1: Initial login request
const login = async (req, res) => {
  const { identifier, password, rememberMe } = req.body;
  try {
    // Check if user exists with the provided identifier
    const user = await findUserByIdentifier(identifier);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Verify the password
    const isMatch = await passwordService.comparePassword(
      password,
      user.password
    );
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    // Check if user is verified
    if (!user.isVerified) {
      const verificationToken = jwtService.generateVerificationToken(user._id);
      await mailService.sendVerificationEmail(
        user.fullname.fname,
        user.email,
        verificationToken
      );
      return res.status(403).json({
        message:
          "Please verify your email. A new verification email has been sent.",
        token: verificationToken,
      });
    }

    const actualDevice = deviceService.getTheDevice(req);

    //Check if the device is already trusted and not expired
    const trustedDevice = user.trustedDevices.find((device) => {
      return (
        device.userAgent === actualDevice.userAgent &&
        device.deviceName === actualDevice.deviceName &&
        new Date(device.addedAt).getTime() + 30 * 24 * 60 * 60 * 1000 >
          Date.now()
      );
    });

    if (trustedDevice) {
      // Generate access token
      const accessToken = jwtService.generateAccessToken(user._id);
      const refreshToken = jwtService.generateRefreshToken(user);
      res
        .status(200)
        .cookie("refreshToken", refreshToken, {
          httpOnly: true,
          secure: true,
          sameSite: "Strict",
          path: "/api/auth/refresh-token",
        })
        .json({
          message: "Login successful.",
          user: {
            id: user._id,
            fullname: user.fullname,
            username: user.username,
            email: user.email,
            phoneNumber: user.phoneNumber,
            roles: user.roles,
          },
          accessToken,
        });
    } else {
      // Generate and send OTP for 2FA
      const otpCode = otpService.generateOTP();
      await otpService.storeOTP(user.email, otpCode);
      // console.log("OTP generated for", user.email, ":", otpCode);
      await mailService.sendOTP(user.email, otpCode);

      return res.status(200).json({
        message: "OTP sent to your email. Please verify to complete login.",
        user: {
          username: user.username,
          email: user.email,
        },
        rememberMe,
        otpCode,
      });
    }
  } catch (err) {
    // console.error(err);
    res.status(500).json({ message: "Server error." });
  }
};

// Verify the OTP and complete login
const verifyOtp = async (req, res) => {
  const { identifier, otp, rememberDevice } = req.body;

  try {
    const user = await findUserByIdentifier(identifier);
    if (!user) {
      // console.error(`User not found for identifier: ${identifier}`);
      return res.status(404).json({ message: "User not found." });
    }
    const isOtpValid = otpService.verifyOTP(user.email, otp);
    // console.log(`Is OTP valid: ${isOtpValid}`);
    if (!isOtpValid) {
      return res.status(401).json({ message: "Invalid or expired OTP." });
    }
    // Generate access token
    const accessToken = jwtService.generateAccessToken(user._id);
    const refreshToken = jwtService.generateRefreshToken(user);

    // Generate Device Identifier
    const actualDevice = deviceService.getTheDevice(req);
    // console.log(`Device info: ${JSON.stringify(actualDevice)}`);

    if (rememberDevice) {
      const newDevice = {
        agent: actualDevice.agent,
        deviceName: actualDevice.deviceName,
        addedAt: new Date(),
      };
      user.trustedDevices.push(newDevice);

      if (user.trustedDevices.length > 5) {
        user.trustedDevices.shift();
      }
      try {
        await user.save();
      } catch (saveError) {
        // console.error("Error saving user:", saveError);
        return res.status(500).json({ message: "Failed to save user." });
      }
    }
    res
      .status(200)
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "Strict",
        path: "/api/auth/refresh-token",
      })
      .json({
        message: "OTP verified successfully. Login successful.",
        user: {
          _id: user._id,
          fullname: user.fullname,
          username: user.username,
          email: user.email,
          phoneNumber: user.phoneNumber,
          roles: user.roles,
          trustedDevices: user.trustedDevices,
        },
        accessToken,
      });
  } catch (err) {
    // console.error(err);
    res.status(500).json({ message: "Server error." });
  }
};

const logout = async (req, res) => {  
  const accessToken = req.headers.authorization?.split(" ")[1];
  if (!accessToken) {
    return res.status(401).json({ message: "No access token provided." });
  }

  try {
    // Verify the access token
    const decoded = jwtService.verifyToken(accessToken);
    if (!decoded) {
      return res.status(401).json({ message: "Unauthorized! Invalid token." });
    }
    // Clear the refresh token cookie
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
      path: "/api/auth/refresh-token",
    });

    // Return success message
    return res.status(200).json({ message: "Logout successful." });
  } catch (error) {
    // console.error(error);

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid access token." });
    } else if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Access token has expired." });
    } else {
      return res
        .status(500)
        .json({ message: "An error occurred during logout." });
    }
  }
};
// Request Password Reset
const requestPasswordReset = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found." });

    // Generate a password reset token
    const resetToken = jwtService.generateVerificationToken(user._id);

    // Send email with reset link
    await mailService.sendPasswordResetEmail(
      user.fullname.fname,
      email,
      resetToken
    );

    return res
      .status(200)
      .json({ message: "Password reset email sent.", token: resetToken });
  } catch (error) {
    // console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

// Reset Password
const resetPassword = async (req, res) => {
  const { token, newPassword, confirmNewPassword } = req.body;
  // console.log("Received ", token);
  if (newPassword !== confirmNewPassword) {
    return res.status(400).json({ message: "Unmatched passwords" });
  }

  try {
    // Verify the reset token
    const userId = jwtService.verifyToken(token);
    if (!userId)
      return res.status(400).json({ message: "Invalid or expired token." });

    // Call updatePassword to hash and update the password
    const updatedUser = await passwordService.updatePassword(
      userId,
      newPassword
    );

    return res
      .status(200)
      .json({ message: "Password reset successfully.", user: updatedUser });
  } catch (error) {
    // console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

// Refresh Token
const refreshToken = async (req, res) => {
  const token = req.cookies.refreshToken;

  if (!token) {
    return res.status(401).json({ message: "Access Denied" });
  }

  const decoded = jwtService.verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ message: "Unauthorized! Invalid token." });
  }

  // Generate new access token
  const newAccessToken = jwtService.generateAccessToken(decoded._id);
  res.status(200).json({ newAccessToken });
};

module.exports = {
  register,
  login,
  verifyOtp,
  logout,
  requestPasswordReset,
  resetPassword,
  refreshToken,
};
