const jwtService = require('../services/jwtService'); 
const mollieService = require('../services/mollieService');
const User = require("../models/User");
const Order = require("../models/Order"); 
const Item = require("../models/Item"); 
const { emitOrderPaid } = require('../services/socketService');

const purchase = async (req, res, io) => {
    try {
        // Step 1: Verify token
        const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Unauthorized' }); // Return 401 for missing token
        }

        const decoded = jwtService.verifyToken(token, process.env.JWT_SECRET);
        if (!decoded) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        // Step 2: Verify user exists
        const user = await User.findById(decoded._id);
        if (!user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        // Step 3: Extract order details from the request body
        const { items: orderItems } = req.body;

        // Check if orderItems is defined and is an array
        if (!Array.isArray(orderItems) || orderItems.length === 0) {
            return res.status(400).json({ message: 'Invalid order data' }); // Check for valid order items here
        }

        const items = [];
        let totalAmount = 0;

        // Step 4: Loop through the items and fetch their details from the database
        for (const { itemId, quantity } of orderItems) {
            if (!itemId || !quantity) {
                return res.status(400).json({ message: 'Invalid item data' });
            }

            const item = await Item.findById(itemId);
            if (!item) {
                return res.status(400).json({ message: `Item ${itemId} not found` }); // Use itemId for clarity
            }

            items.push({ item: itemId, quantity: quantity });
            totalAmount += item.price * quantity; // Assumes item.price exists
        }

        const payment = await mollieService.createPayment(totalAmount, `Order By ${user.username}`);
        
        // Check payment creation
        if (!payment || !payment.id) {
            return res.status(500).json({ message: 'Payment creation failed' });
        }

        // Step 5: Create the order
        const newOrder = new Order({
            user: user._id,
            items: items,
            totalAmount: totalAmount,
            status: 'Pending',
            paymentId: payment.id,
        });

        // Step 6: Save the order to the database
        await newOrder.save();

        const message = `Order ${newOrder._id} has been placed by ${user.username}`;
        if( payment.status === 'paid' ) {
            emitOrderPaid(io, newOrder._id, message);
        }

        // Step 7: Respond with success
        return res.status(201).json({
            message: 'Order placed successfully',
            order: newOrder,
            paymentLink: payment._links.checkout.href,
        });

    } catch (error) {
        console.error('Error processing purchase:', error); // More specific logging
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};

module.exports = { purchase };
