const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  banUser,
  switchRoleToDelivery
} = require("../controllers/userController");
const { isAdmin } = require("../middlewares/adminMiddleware");

// get all users
router.get("/users", isAdmin, getAllUsers);

// get user
router.get("/user/:id", getUserById);

// create user
router.post("/createUser", authMiddleware, isAdmin, createUser);

// update user
router.put("/UpdateUser/:id", authMiddleware, isAdmin, updateUser);

// banne the user
router.put("/banneUser/:id", authMiddleware,isAdmin, banUser);

// switch role
router.post("/switchRole/:id", authMiddleware,isAdmin, switchRoleToDelivery);

module.exports = router;