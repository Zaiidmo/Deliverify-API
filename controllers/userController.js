// controllers/userController.js
const mongoose = require("mongoose");
const User = require("../models/User");
const Role = require("../models/Role");
const Order = require("../models/Order");
const passwordService = require("../services/passwordService");
const { validateRegistration } = require("../validations/authValidations");
const logService = require("../services/logService");

// -- helpers ----------------------------------------------------
const toObjectId = (id) => new mongoose.Types.ObjectId(id);

const publicUser = (u) => {
  if (!u) return null;
  return {
    id: u._id,
    fullname: u.fullname,
    username: u.username,
    email: u.email,
    phoneNumber: u.phoneNumber,
    CIN: u.CIN,
    address: u.address,
    avatar: u.avatar,
    roles: (u.roles || []).map((r) => (typeof r === "string" ? r : r?.name || r?._id)),
    isVerified: u.isVerified,
    isBanned: u.isBanned,
    trustedDevices: u.trustedDevices,
    createdAt: u.createdAt,
    updatedAt: u.updatedAt,
  };
};

// -- ADMIN: list all users --------------------------------------
const getAllUsers = async (_req, res) => {
  try {
    const users = await User.find().populate("roles").lean();
    res.status(200).json(users.map(publicUser));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// -- ADMIN: get user by id --------------------------------------
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate("roles").lean();
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(publicUser(user));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// -- ADMIN: create user -----------------------------------------
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

    // Validate
    const { isValid, message } = validateRegistration(req.body);
    if (!isValid) return res.status(400).json({ message });

    // Uniqueness
    const dup = await User.findOne({
      $or: [{ username }, { email }, { phoneNumber }, { CIN }],
    });
    if (dup) {
      return res.status(400).json({ message: "User with given identifiers already exists." });
    }

    // Roles
    const roles = await Role.find({ name: { $in: roleNames } });
    if (roles.length === 0) return res.status(400).json({ message: "Invalid role(s) provided." });

    // Hash + save
    const hashedPassword = await passwordService.hashPassword(password);
    const newUser = await User.create({
      fullname,
      username,
      email,
      CIN,
      phoneNumber,
      password: hashedPassword,
      roles: roles.map((r) => r._id),
      isVerified: true,
    });

    // best-effort log
    try {
      await logService.addLog(req.user?._id, "CREATE_USER", {
        fullname: `${newUser.fullname.fname} ${newUser.fullname.lname}`,
        ip: req.ip,
        username: newUser.username,
      });
    } catch {}

    res.status(201).json({ message: "User created.", user: publicUser(newUser) });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// -- ADMIN: update arbitrary user --------------------------------
const updateUser = async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    })
      .populate("roles")
      .lean();

    if (!updatedUser) return res.status(404).json({ message: "User not found" });

    try {
      await logService.addLog(req.user?._id, "UPDATE_USER", {
        fullname: `${updatedUser.fullname?.fname ?? ""} ${updatedUser.fullname?.lname ?? ""}`.trim(),
        ip: req.ip,
        username: updatedUser.username,
      });
    } catch {}

    res.status(200).json({ message: "Updated", user: publicUser(updatedUser) });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// -- ADMIN: ban user ---------------------------------------------
const banUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isBanned: true },
      { new: true }
    ).lean();
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ message: "User banned", user: publicUser(user) });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// -- AUTHED: current user profile --------------------------------
const getMe = async (req, res) => {
  try {
    const me = await User.findById(req.user._id).populate("roles").lean();
    if (!me) return res.status(404).json({ message: "User not found" });
    res.json(publicUser(me));
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// -- AUTHED: update my profile (safe fields only) ----------------
const updateMe = async (req, res) => {
  try {
    const allowed = {};
    if (req.body.fullname?.fname) allowed["fullname.fname"] = req.body.fullname.fname;
    if (req.body.fullname?.lname) allowed["fullname.lname"] = req.body.fullname.lname;
    if (req.body.username) allowed.username = req.body.username;
    if (req.body.phoneNumber) allowed.phoneNumber = req.body.phoneNumber;
    if (req.body.address !== undefined) allowed.address = req.body.address;
    if (req.body.avatar !== undefined) allowed.avatar = req.body.avatar;

    // Uniqueness checks for username/phone/email if provided
    const conflicts = [];
    if (allowed.username) {
      const exists = await User.findOne({ username: allowed.username, _id: { $ne: req.user._id } }).lean();
      if (exists) conflicts.push("username");
    }
    if (allowed.phoneNumber) {
      const exists = await User.findOne({ phoneNumber: allowed.phoneNumber, _id: { $ne: req.user._id } }).lean();
      if (exists) conflicts.push("phoneNumber");
    }
    if (conflicts.length) {
      return res.status(409).json({ message: `Already in use: ${conflicts.join(", ")}` });
    }

    const updated = await User.findByIdAndUpdate(req.user._id, allowed, { new: true })
      .populate("roles")
      .lean();

    res.json({ message: "Profile updated", user: publicUser(updated) });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// -- AUTHED: my orders (paginated + optional status filter) ------
const getMyOrders = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page ?? "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit ?? "20", 10)));
    const skip = (page - 1) * limit;

    const filters = { user: req.user._id };
    if (req.query.status) {
      const statuses = String(req.query.status)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      if (statuses.length) filters.status = { $in: statuses };
    }

    const [total, orders] = await Promise.all([
      Order.countDocuments(filters),
      Order.find(filters)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate({ path: "items.item", select: "name price image category" })
        .lean(),
    ]);

    res.json({
      page,
      limit,
      total,
      orders,
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// -- AUTHED: quick stats (total spent, counts) -------------------
const getMyStats = async (req, res) => {
  try {
    const match = {
      user: toObjectId(req.user._id),
    };

    // Consider orders "count toward spend" if Paid or Delivered
    const spendStatuses = ["Paid", "Delivered"];
    const deliveredStatus = "Delivered";

    const [agg] = await Order.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          spent: {
            $sum: {
              $cond: [{ $in: ["$status", spendStatuses] }, "$totalAmount", 0],
            },
          },
          lastOrderAt: { $max: "$createdAt" },
        },
      },
    ]);

    // When there are multiple status groups, above returns multiple docs.
    // So re-aggregate in JS (keeps pipeline simple & performant).
    const docs = await Order.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          spent: {
            $sum: {
              $cond: [{ $in: ["$status", spendStatuses] }, "$totalAmount", 0],
            },
          },
          lastOrderAt: { $max: "$createdAt" },
        },
      },
    ]);

    const totals = docs.reduce(
      (acc, d) => {
        acc.totalOrders += d.count;
        acc.totalSpent += d.spent || 0;
        if (d._id === deliveredStatus) acc.completedCount += d.count;
        if (!acc.lastOrderAt || (d.lastOrderAt && d.lastOrderAt > acc.lastOrderAt)) {
          acc.lastOrderAt = d.lastOrderAt;
        }
        return acc;
      },
      { totalOrders: 0, totalSpent: 0, completedCount: 0, lastOrderAt: null }
    );

    res.json(totals);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// -- AUTHED: add Delivery role to current user -------------------
const switchRoleToDelivery = async (req, res) => {
  try {
    const deliveryRole = await Role.findOne({ name: "Delivery" });
    if (!deliveryRole) return res.status(404).json({ message: "Delivery role not found" });

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const roleId = deliveryRole._id.toString();
    const alreadyHas = user.roles.map(String).includes(roleId);
    if (!alreadyHas) {
      user.roles.push(deliveryRole._id);
      await user.save();
    }

    res.status(200).json({ message: "Role granted", user: publicUser(user.toObject()) });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// -- exports -----------------------------------------------------
module.exports = {
  // admin
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  banUser,

  // authed self-service
  getMe,
  updateMe,
  getMyOrders,
  getMyStats,
  switchRoleToDelivery,
};
