const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  banUser,
} = require("../controllers/userController");
const { switchRoleToDelivery } = require("../controllers/switchRoleController");

// get all users
router.get("/users", getAllUsers);

// get user
router.get("/user/:id", getUserById);

// create user
router.post("/createUser", authMiddleware, createUser);

// update user
router.put("/UpdateUser/:id", authMiddleware, updateUser);

// banne the user
router.put("/banneUser/:id", authMiddleware, banUser);

// switch role
router.post("/switchRole/:id", authMiddleware, switchRoleToDelivery);

module.exports = router;