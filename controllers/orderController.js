const jwtService = require('../services/jwtService'); 
const mollieService = require('../services/mollieService');
const User = require("../models/User");
const Order = require("../models/Order"); 
const Item = require("../models/Item"); 

const purchase = async (req, res) => {
    try {
        // Step 1: Verify token
        const token = req.headers.authorization.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Unauthorized' });
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
        if (!orderItems || orderItems.length === 0 ) {
            return res.status(400).json({ message: 'Invalid order data' });
        }

        const items = [];
        let totalAmount = 0;

        // Step 4: Loop through the items and fetch their details from the database
        for (let i = 0; i < orderItems.length; i++) {
            const { itemId, quantity } = orderItems[i];

            const item = await Item.findById(itemId);
            if (!item) {
                return res.status(400).json({ message: `Item ${item.name} not found` });
            }

            items.push({
                item: itemId,
                quantity: quantity
            });

            // Calculate total amount (assuming `price` field exists in the Item model)
            totalAmount += item.price * quantity;
        }

        const payment = await mollieService.createPayment(totalAmount, `Order By ${user.username}`);

        // Step 5: Create the order
        const newOrder = new Order({
            user: user._id, 
            items: items,   
            totalAmount: totalAmount,
            status: 'Pending',
            paymentId: payment.id,
        });

        console.log(newOrder);
        
        // Step 6: Save the order to the database
        await newOrder.save();

        // Step 7: Respond with success
        return res.status(201).json({
            message: 'Order placed successfully',
            order: newOrder,
            paymentLink: payment._links.checkout.href,
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};

module.exports = { purchase };
