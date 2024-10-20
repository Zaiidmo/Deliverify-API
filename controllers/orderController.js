const jwtService = require('../services/jwtService'); 
const mollieService = require('../services/mollieService');
const socketService = require('../services/socketService');
const User = require("../models/User");
const Order = require("../models/Order"); 
const Item = require("../models/Item"); 

const purchase = async (req, res, io) => {
    try {
        // Step 1: Verify token
        const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Unauthorized: Missing token' });
        }

        const decoded = jwtService.verifyToken(token, process.env.JWT_SECRET);
        if (!decoded) {
            return res.status(401).json({ message: 'Unauthorized: Invalid token' });
        }

        // Step 2: Verify user exists
        const user = await User.findById(decoded._id);
        if (!user) {
            return res.status(401).json({ message: 'Unauthorized: User not found' });
        }

        // Step 3: Extract order details from the request body
        const { items: orderItems } = req.body;

        // Check if orderItems is defined and is an array
        if (!Array.isArray(orderItems) || orderItems.length === 0) {
            return res.status(400).json({ message: 'Invalid order data: No items provided' });
        }

        const items = [];
        let totalAmount = 0;

        // Step 4: Loop through the items and fetch their details from the database
        for (const { itemId, quantity } of orderItems) {
            if (!itemId || !quantity) {
                return res.status(400).json({ message: 'Invalid item data: Missing itemId or quantity' });
            }

            const item = await Item.findById(itemId);
            if (!item) {
                return res.status(400).json({ message: `Invalid item data: Item ${itemId} not found` });
            }

            items.push({ item: itemId, quantity: quantity });
            totalAmount += item.price * quantity; // Assumes item.price exists
        }

        // Step 5: Create payment
        const payment = await mollieService.createPayment(totalAmount, `Order By ${user.username}`);
        
        // Check payment creation
        if (!payment || !payment.id) {
            return res.status(500).json({ message: 'Payment creation failed' });
        }

        // Step 6: Create the order
        const newOrder = new Order({
            user: user._id,
            items: items,
            totalAmount: totalAmount,
            status: payment.status === 'paid' ? 'Paid' : 'Pending',
            paymentId: payment.id,
        });

        socketService.notifyDeliveryPersons(newOrder);
        // Step 7: Save the order to the database
        await newOrder.save();

        // Step 8: Respond with success
        return res.status(201).json({
            message: 'Order placed successfully',
            order: newOrder,
            paymentLink: payment._links.checkout.href,
        });

    } catch (error) {
        console.error('Error processing purchase:', error);
        return res.status(500).json({ message: 'Internal Server Error: ' + error.message });
    }
};

const getOrderStatus = async (req, res) => {
    try {
        const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Unauthorized: Missing token' });
        }
        
        const decoded = jwtService.verifyToken(token, process.env.JWT_SECRET);
        if (!decoded) {
            return res.status(401).json({ message: 'Unauthorized: Invalid token' });
        }

        const userId = decoded._id;

        const orders = await Order.find({ user: userId });
        if (!orders || orders.length === 0) {
            return res.status(404).json({ message: 'No orders found' });
        }
        return res.status(200).json({ orders });
    } catch (error) {
        console.error('Error getting order status:', error);
        return res.status(500).json({ message: 'Internal Server Error: ' + error.message });
    }
};
module.exports = { purchase, getOrderStatus };
