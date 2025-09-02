// mollieService.js
require('dotenv').config();
const { createMollieClient } = require('@mollie/api-client');

const mollieClient = createMollieClient({ apiKey: process.env.MOLLIE_API_KEY });

/**
 * Creates a payment with Mollie.
 * @param {Number} totalAmount - The total amount to charge the customer.
 * @param {String} description - Description of the payment.
 * @param {Object} opts - Optional { redirectUrl, webhookUrl, metadata }
 * @returns {Object} - The Mollie payment object (normalized).
 */
const createPayment = async (totalAmount, description, opts = {}) => {
  const {
    redirectUrl = `${process.env.CLIENT_URL}/payment-success`,  // ← default keeps web as-is
    webhookUrl,                                                 // enable when you’re ready
    metadata = {}
  } = opts;

  try {
    const payment = await mollieClient.payments.create({
      amount: { currency: 'EUR', value: totalAmount.toFixed(2) },
      description,
      redirectUrl,
      ...(webhookUrl ? { webhookUrl } : {}),
      ...(Object.keys(metadata).length ? { metadata } : {})
    });

    // Normalize the output so callers don’t care about Mollie’s link shape
    return {
      id: payment.id,
      status: payment.status,
      isPaid: payment.isPaid,
      checkoutUrl: payment._links?.checkout?.href || null,
      raw: payment
    };
  } catch (error) {
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
    return payment.isPaid === true;
  } catch (error) {
    throw error;
  }
};

module.exports = { createPayment, isPaymentSuccessful };
