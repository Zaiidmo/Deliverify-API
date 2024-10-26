const mollieService = require('../services/mollieService');
const Order = require('../models/Order');
const socketService = require('../services/socketService');
const logService = require('../services/logService');
const User = require('../models/User');

const mollieWebhook = async (req, res) => {
    try {
        // Get the payment ID from Mollie's webhook request
        const paymentId = req.body.id;

        // Fetch the payment status from Mollie
        const payment = await mollieService.isPaymentSuccessful(paymentId);
        if (!payment) {
            return res.status(404).json({ message: 'Payment not found' });
        }

        // Find the order linked to this payment
        const order = await Order.findOne({ paymentId }).populate('user');
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Update order status based on payment result
        if (payment.status === 'paid') {
            order.status = 'Paid';
            await order.save();

            // Log payment success
            try {
                const user = await User.findById(req.user._id || order.user._id);
                await logService.addLog(user._id, 'PAYMENT_SUCCESS', {
                    orderId: order._id,
                    message: `Order ${order._id} has been paid successfully`,
                    status: order.status
                });
            } catch (error) {
                console.error('Error logging payment success:', error);
            }

            // Notify user about successful payment
            socketService.notifyUser(order.user._id, 'paymentSuccess', {
                orderId: order._id,
                message: `Order ${order._id} has been paid successfully`,
                status: order.status
            });

            // Notify delivery persons about new order
            socketService.notifyDeliveryPersons(order);

        } else if (payment.status === 'failed') {
            order.status = 'failedPayment';
            await order.save();

            // Log payment failure
            try {
                const user = await User.findById(req.user._id || order.user._id);
                await logService.addLog(user._id, 'PAYMENT_FAILED', {
                    orderId: order._id,
                    message: `Payment failed for order ${order._id}`,
                    status: order.status
                });
            } catch (error) {
                console.error('Error logging payment failure:', error);
            }

            // Notify user about failed payment
            socketService.notifyUser(order.user._id, 'paymentFailed', {
                orderId: order._id,
                message: `Payment failed for order ${order._id}`,
                status: order.status
            });
        }

        // Respond to Mollie that the webhook was processed successfully
        return res.status(200).json({ message: 'Webhook processed successfully' });

    } catch (error) {
        console.error('Error in handling Mollie webhook:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};

module.exports = { mollieWebhook };