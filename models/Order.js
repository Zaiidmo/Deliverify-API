const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    items: [
        {
            item: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Item",
                required: true
            },
            quantity: {
                type: Number,
                required: true
            }
        }
    ],
    Delivery:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    status: {
        type: String,
        enum: ["Pending", "Preparing", "Accepted", "Picked_up","Reported ", "Delivered", "Cancelled"],
        default: "Pending"
    },
    totalAmount : {
        type: Number,
        required: true
    },
});

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;