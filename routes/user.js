// routes/user.js
const express = require("express");
const router = express.Router();
const auth = require("../middlewares/authMiddleware");
const { isAdmin } = require("../middlewares/adminMiddleware");

const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  banUser,
  // self-service
  getMe,
  updateMe,
  getMyOrders,
  getMyStats,
  switchRoleToDelivery,
} = require("../controllers/userController");

// ---------- Admin endpoints ----------
router.get("/", isAdmin, getAllUsers);
router.get("/user/:id", isAdmin, getUserById);
router.post("/createUser", auth, isAdmin, createUser);
router.put("/updateUser/:id", auth, isAdmin, updateUser);
router.put("/banUser/:id", auth, isAdmin, banUser);

// ---------- Authed user (profile) ----------
router.get("/me", auth, getMe);
router.patch("/me", auth, updateMe);
router.get("/me/orders", auth, getMyOrders);
router.get("/me/stats", auth, getMyStats);

// ---------- Roles ----------
router.post("/switchRole", auth, switchRoleToDelivery);

module.exports = router;
