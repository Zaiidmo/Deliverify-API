//C:\Users\Youcode\Desktop\Deliverify-API\services\orderService.js
const { Order } = require('../models/Order');
const activityService = require('./activityService');

const orderService = {
  createOrder: async (orderData) => {
    try {
      const order = new Order(orderData);
      await order.save();
      return order;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  },

  getOrderById: async (orderId) => {
    try {
      const order = await Order.findById(orderId)
        .populate('user', 'username')
        .populate('items.item')
        .populate('Delivery', 'username');
      return order;
    } catch (error) {
      console.error('Error fetching order:', error);
      throw error;
    }
  },

  getUserOrders: async (userId, page = 1, limit = 10) => {
    try {
      const orders = await Order.find({ user: userId })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('items.item')
        .populate('Delivery', 'username');
      return orders;
    } catch (error) {
      console.error('Error fetching user orders:', error);
      throw error;
    }
  },

  getRestaurantOrders: async (restaurantId, page = 1, limit = 10) => {
    try {
      const orders = await Order.find({ 'items.item.restaurant': restaurantId })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('user', 'username')
        .populate('items.item')
        .populate('Delivery', 'username');
      return orders;
    } catch (error) {
      console.error('Error fetching restaurant orders:', error);
      throw error;
    }
  },

  updateOrderStatus: async (orderId, newStatus, userId) => {
    try {
      const order = await Order.findByIdAndUpdate(
        orderId,
        { status: newStatus },
        { new: true }
      );
      await activityService.logOrderStatusChange(userId, orderId, newStatus);
      return order;
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  },

  cancelOrder: async (orderId, userId) => {
    try {
      const order = await Order.findByIdAndUpdate(
        orderId,
        { status: 'Cancelled' },
        { new: true }
      );
      await activityService.logOrderCancellation(userId, orderId);
      return order;
    } catch (error) {
      console.error('Error cancelling order:', error);
      throw error;
    }
  },

  assignDelivery: async (orderId, deliveryUserId) => {
    try {
      const order = await Order.findByIdAndUpdate(
        orderId,
        { Delivery: deliveryUserId, status: 'Accepted' },
        { new: true }
      );
      await activityService.logDeliveryAccepted(deliveryUserId, orderId);
      return order;
    } catch (error) {
      console.error('Error assigning delivery:', error);
      throw error;
    }
  },

  updateDeliveryStatus: async (orderId, newStatus, deliveryUserId) => {
    try {
      const order = await Order.findByIdAndUpdate(
        orderId,
        { status: newStatus },
        { new: true }
      );
      
      if (newStatus === 'Picked_up') {
        await activityService.logDeliveryPickedUp(deliveryUserId, orderId);
      } else if (newStatus === 'Delivered') {
        await activityService.logDeliveryCompleted(deliveryUserId, orderId);
      }
      
      return order;
    } catch (error) {
      console.error('Error updating delivery status:', error);
      throw error;
    }
  },

  getOrderAnalytics: async (restaurantId, startDate, endDate) => {
    try {
      const analytics = await Order.aggregate([
        {
          $match: {
            'items.item.restaurant': mongoose.Types.ObjectId(restaurantId),
            createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) }
          }
        },
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            totalRevenue: { $sum: '$totalAmount' },
            averageOrderValue: { $avg: '$totalAmount' }
          }
        }
      ]);
      return analytics[0] || { totalOrders: 0, totalRevenue: 0, averageOrderValue: 0 };
    } catch (error) {
      console.error('Error getting order analytics:', error);
      throw error;
    }
  }
};

module.exports = orderService;