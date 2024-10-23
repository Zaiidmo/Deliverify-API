const User = require("../models/User");
const Role = require("../models/Role");
const passwordService = require("../services/passwordService")
const { validateRegistration } = require("../validations/authValidations");

// get all users
const getAllUsers = async (req, res) => {
  try {
    // console.log("here");
    
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// check user's existance 
const findExistingUser = async (username, email, phoneNumber) => {
  return await User.findOne({
    $or: [{ username }, { email }, { phoneNumber }],
  });
};

// get user
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    // 404 and 500
    res.status(404).json({ message: "User not found" });
    res.status(500).json({ message: error.message });
  }
};

// create user
const createUser = async (req, res) => {
  try {
    const {
      fullname,
      username,
      email,
      phoneNumber,
      CIN,
      password,
      roles: roleNames,
    } = req.body;

    // Validate user input
    const { isValid, message } = validateRegistration(req.body);
    if (!isValid) {
      return res.status(400).json({ message });
    }

    // Check if user already exists
    const existingUser = await findExistingUser(username, email, phoneNumber);
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Username, Email, or Phone Number already exists." });
    }

    // Set user roles
    let roles = await Role.find({ name: { $in: roleNames } });
    if (roles.length === 0) {
      return res.status(400).json({ message: "Invalid role(s) provided." });
    }

    // Hash password
    const hashedPassword = await passwordService.hashPassword(password);
    // Create a new user
    const newUser = new User({
      fullname,
      username,
      email,
      CIN,
      phoneNumber,
      password: hashedPassword,
      roles: roles.map((role) => role._id),
      isVerified: true,
    });

    await newUser.save();

    res.status(201).json({
      message: "User registered successfully.",
      user: {
        fullname,
        username,
        email,
        phoneNumber,
        roles: newUser.roles,
      },
    });
  } catch (err) {
    console.error("Error during registration:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// update user
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedUser = await User.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({"Updated fields": req.body, "User": updatedUser});
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// banne the user
const banUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndUpdate(
      id,
      { isBanned: true },
      {
        new: true,
      }
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({message: "User banned", "User": user});
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
}

const switchRoleToDelivery = async (req, res) => {
  const { id } = req.params; 
  const deliveryRole = await Role.findOne({ name: "Delivery" });

  try {
    // Find the user by ID
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Switch the user's role to Delivery
    user.roles = [deliveryRole._id]; 
    await user.save(); 

    return res.status(200).json({ message: "Role switched to Delivery", user });
  } catch (error) {
    console.error("Error switching role: ", error);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  getUserById,
  createUser,
  updateUser,
  banUser,
  switchRoleToDelivery,
};
