const mollieClient = require('@mollie/api-client')({ apiKey: process.env.MOLLIE_API_KEY });

/**
 * Creates a payment with Mollie.
 * @param {Number} totalAmount - The total amount to charge the customer.
 * @param {String} description - Description of the payment.
 * @returns {Object} - The Mollie payment object.
 */
const createPayment = async (totalAmount, description) => {
    try {
        const payment = await mollieClient.payments.create({
            amount: {
                currency: 'EUR',
                value: totalAmount.toFixed(2)
            },
            description: description,
            redirectUrl: `${process.env.CLIENT_URL}/payment-success`, 
            // webhookUrl: 'https://yourwebsite.com/webhook'
        });

        return payment;
    } catch (error) {
        console.error('Error creating payment:', error);
        throw error;
    }
};

/**
 * Checks if a Mollie payment was successful.
 * @param {String} paymentId 
 * @returns {Boolean} 
 */

const isPaymentSuccessful = async (paymentId) => {
    try {
        const payment = await mollieClient.payments.get(paymentId);
        return payment.isPaid;
    } catch (error) {
        console.error('Error checking payment status:', error);
        throw error;
    }
}

module.exports = {
    createPayment,
    isPaymentSuccessful
};
 
