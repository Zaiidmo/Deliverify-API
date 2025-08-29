// orderController.js
const jwtService = require("../services/jwtService");
const mollieService = require("../services/mollieService");
const OptService = require("../services/otpService");
const socketService = require("../services/socketService");
const User = require("../models/User");
const Order = require("../models/Order");
const Item = require("../models/Item");
const logService = require("../services/logService");
const mongoose = require("mongoose");
const { getPayment } = require("../services/mollieService");

const purchase = async (req, res) => {
  try {
    // 1) Auth
    const token =
      req.headers.authorization && req.headers.authorization.split(" ")[1];
    if (!token)
      return res.status(401).json({ message: "Unauthorized: Missing token" });

    const decoded = jwtService.verifyToken(token, process.env.JWT_SECRET);
    if (!decoded)
      return res.status(401).json({ message: "Unauthorized: Invalid token" });

    const user = await User.findById(decoded._id);
    if (!user)
      return res.status(401).json({ message: "Unauthorized: User not found" });

    // 2) Input
    const {
      items: orderItems,
      address,
      paymentMethod,
      notes,
      restaurantId,
      returnUrl,
    } = req.body;
    if (!Array.isArray(orderItems) || orderItems.length === 0) {
      return res
        .status(400)
        .json({ message: "Invalid order data: No items provided" });
    }

    // 3) Recalculate totals
    const items = [];
    let totalAmount = 0;

    for (const { itemId, quantity } of orderItems) {
      if (!itemId || !quantity) {
        return res
          .status(400)
          .json({ message: "Invalid item data: Missing itemId or quantity" });
      }
      const item = await Item.findById(itemId);
      if (!item) {
        return res
          .status(400)
          .json({ message: `Invalid item data: Item ${itemId} not found` });
      }
      items.push({ item: itemId, quantity });
      totalAmount += Number(item.price) * Number(quantity);
    }

    // 4) Pre-generate order id
    const orderId = new mongoose.Types.ObjectId();

    // 5) Build redirectUrl (mobile if provided, else web)
    const redirectUrl = returnUrl
      ? `${returnUrl}?status=success&orderId=${orderId}`
      : `${process.env.CLIENT_URL}/payment-success?orderId=${orderId}`;

    const bridgeUrl = `${
      process.env.CLIENT_URL_BRIDGE
    }/?orderId=${encodeURIComponent(orderId)}`;
    
    // 6) Create Mollie payment FIRST (put orderId in metadata)
    //   NOTE: this expects mollieService.createPayment(amount, desc, opts)
    const payment = await mollieService.createPayment(
      totalAmount,
      `Order #${orderId} by ${user.username}`,
      {
        redirectUrl: bridgeUrl,
        // webhookUrl: `${process.env.BASE_URL}/api/webhooks/mollie`,
        metadata: { orderId: String(orderId), userId: String(user._id) },
      }
    );

    if (!payment || !payment.id) {
      return res.status(500).json({ message: "Payment creation failed" });
    }

    // 7) Create & save order WITH paymentId present (single save)
    const newOrder = new Order({
      _id: orderId,
      user: user._id,
      items,
      address,
      notes,
      restaurant: restaurantId,
      totalAmount,
      otpConfirm: OptService.generateOTP(),
      status: "Pending",
      paymentProvider: "mollie",
      paymentStatus: "open",
      paymentId: payment.id,
      paymentLink:
        payment.checkoutUrl || payment._links?.checkout?.href || null,
    });

    await newOrder.save();

    // 8) Notify delivery
    socketService.notifyDeliveryPersons(newOrder);

    console.log(newOrder);

    // 9) Respond
    return res.status(201).json({
      message: "Order placed successfully",
      order: newOrder,
      paymentLink: newOrder.paymentLink,
      checkoutUrl: newOrder.paymentLink,
    });
  } catch (error) {
    console.error("Error processing purchase:", error);
    return res
      .status(500)
      .json({ message: "Internal Server Error: " + error.message });
  }
};

const getOrderStatus = async (req, res) => {
  try {
    const token =
      req.headers.authorization && req.headers.authorization.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Unauthorized: Missing token" });
    }

    const decoded = jwtService.verifyToken(token, process.env.JWT_SECRET);
    if (!decoded) {
      return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }

    const userId = decoded._id;

    const orders = await Order.find({ user: userId });
    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: "No orders found" });
    }
    return res.status(200).json({ orders });
  } catch (error) {
    console.error("Error getting order status:", error);
    return res
      .status(500)
      .json({ message: "Internal Server Error: " + error.message });
  }
};

const confirmDelivery = async (req, res) => {
  try {
    const token =
      req.headers.authorization && req.headers.authorization.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Unauthorized: Missing token" });
    }

    const decoded = jwtService.verifyToken(token, process.env.JWT_SECRET);
    if (!decoded) {
      return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }

    const user = await User.findById(decoded._id).populate("roles");
    if (!user || !user.roles.some((role) => role.name === "Delivery")) {
      return res
        .status(403)
        .json({ message: "Forbidden: Only Delivery Persons" });
    }

    const { orderId, OtpConfirm } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.otpConfirm !== OtpConfirm) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // Update the order's delivery confirmation status
    order.status = "Delivered";
    await order.save();

    try {
      const user = await User.findById(req.user._id);
      await logService.addLog(user._id, "CONFIRM_DELIVERY", {
        user: user._id,
        ip: req.ip,
        username: user.username,
        fullname: user.fullname.fname + " " + user.fullname.lname,
      });
    } catch (logError) {
      console.error(" Error durring add user action to Logs :", logError);
    }

    return res
      .status(200)
      .json({ message: "Delivery confirmed successfully", order });
  } catch (error) {
    console.error("Error confirming delivery:", error);
    return res
      .status(500)
      .json({ message: "Internal Server Error: " + error.message });
  }
};

const getPendingOrders = async (req, res) => {
  try {
    const token =
      req.headers.authorization && req.headers.authorization.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Unauthorized: Missing token" });
    }

    const decoded = jwtService.verifyToken(token, process.env.JWT_SECRET);
    if (!decoded) {
      return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }

    const user = await User.findById(decoded._id);
    if (
      !user ||
      !user.roles.some(
        (role) => role.name === "Delivery" || role.name === "Admin"
      )
    ) {
      return res
        .status(403)
        .json({ message: "Forbidden: Only Delivery Persons" });
    }

    const orders = await Order.find({ status: "Pending" || "Paid" });
    return res.status(200).json({ orders });
  } catch (error) {
    console.error("Error getting pending orders:", error);
    return res
      .status(500)
      .json({ message: "Internal Server Error: " + error.message });
  }
};

const confirmPayment = async (req, res) => {
  try {
    const { orderId, paymentId } = req.body;
    if (!paymentId && !orderId)
      return res.status(400).json({ message: "Missing orderId or paymentId" });

    // find order by paymentId or id
    const order = paymentId
      ? await Order.findOne({ paymentId })
      : await Order.findById(orderId);

    if (!order) return res.status(404).json({ message: "Order not found" });

    const p = await getPayment(order.paymentId);
    if (p.isPaid) {
      order.status = "Paid";
      order.paymentStatus = "paid";
      order.paidAt = p.paidAt || new Date();
      await order.save();
    }
    return res.json({
      status: order.status,
      paymentStatus: order.paymentStatus,
      orderId: String(order._id),
    });
  } catch (e) {
    console.error("confirmPayment error", e);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  purchase,
  getOrderStatus,
  confirmDelivery,
  getPendingOrders,
  confirmPayment,
};
