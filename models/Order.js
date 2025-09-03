const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [
      {
        item: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Item",
          required: true,
        },
        quantity: { type: Number, required: true },
      },
    ],
    Delivery: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    otpConfirm: { type: String, required: true },
    status: {
      type: String,
      enum: [
        "Pending",
        "Paid",
        "failedPayment",
        "Preparing",
        "Accepted",
        "Picked_up",
        "Reported",
        "Delivered",
        "Cancelled",
      ],
      default: "Pending",
    },
    totalAmount: { type: Number, required: true },

    paymentId: { type: String, required: true },

    paymentLink: { type: String },

    // (optional but recommended for auditing)
    paymentProvider: { type: String, default: "mollie" },
    paymentStatus: {
      type: String,
      enum: ["open", "paid", "canceled", "failed"],
      default: "open",
    },
  },
  { timestamps: true }
);
orderSchema.index({ user: 1, createdAt: -1 }); // speeds up /me/orders & /me/stats
module.exports = mongoose.model("Order", orderSchema);
