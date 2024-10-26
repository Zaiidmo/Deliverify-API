const Order = require('../models/Order');

class OrderService {
  async createOrder(userId, items, totalAmount, paymentId, otpConfirm) {
    try {
      const order = new Order({
        user: userId,
        items: items,
        totalAmount: totalAmount,
        paymentId: paymentId,
        otpConfirm: otpConfirm
      });
      await order.save();
      return order;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async updateOrderStatus(orderId, status) {
    try {
      const order = await Order.findByIdAndUpdate(orderId, { status: status }, { new: true });
      if (!order) throw new Error('Order not found');
      return order;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async getOrderById(orderId) {
    try {
      const order = await Order.findById(orderId).populate('user items.item');
      if (!order) throw new Error('Order not found');
      return order;
    } catch (error) {
      throw new Error(error.message);
    }
  }
}

module.exports = new OrderService();
