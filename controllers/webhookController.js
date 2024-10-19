const mollieService = require('../services/mollieService');
const Order = require('../models/Order');

const mollieWebhook = async (req, res) => {
    try {
        // Get the payment ID from Mollie's webhook request
        const paymentId = req.body.id;

        // Fetch the payment status from Mollie
        const payment = await mollieService.isPaymentSuccessful(paymentId);
        if (!payment ) {
            return res.status(404).json({ message: 'Payment not found' });
        }

        // Find the order linked to this payment
        const order = await Order.findOne({ paymentId });
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Update order status based on payment result
        if (payment.status === 'paid') {
            order.status = 'Paid';  // Payment successful
        } else if (payment.status === 'failed') {
            order.status = 'failedPayment';  // Payment failed
        }

        // Save the updated order
        await order.save();

        const message = `Order ${order._id} has been ${order.status.toLowerCase()} by ${order.user.username}`;
        // Emit event to notify clients about the order status
        emitOrderPaid(io, order._id, message);

        // Respond to Mollie that the webhook was processed successfully
        return res.status(200).json({ message: 'Webhook processed successfully' });
    } catch (error) {
        console.error('Error in handling Mollie webhook:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};

module.exports = { mollieWebhook };
