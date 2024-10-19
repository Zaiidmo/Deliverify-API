//C:\Users\Youcode\Desktop\Deliverify-API\services\logService.js
const Log = require("../models/Log");

const logService = {
  
  async addLog(userId, action, details) {
    try {
      const log = new Log({
        user: userId,
        action,
        details
      });
      await log.save();
      console.log("Log added successfully:", action);
    } catch (error) {
      console.error("Error adding log:", error);
      throw error; 
    }
  },

  // User related logs
  async userRegistration(userId, username) {
    await this.addLog(userId, "USER_REGISTRATION", { username });
  },

  async userLogin(userId) {
    await this.addLog(userId, "USER_LOGIN", {});
  },

  async userLogout(userId) {
    await this.addLog(userId, "USER_LOGOUT", {});
  },

  async userProfileUpdate(userId, updatedFields) {
    await this.addLog(userId, "USER_PROFILE_UPDATE", { updatedFields });
  },

  async userPasswordChange(userId) {
    await this.addLog(userId, "USER_PASSWORD_CHANGE", {});
  },

  async userDeviceAdded(userId, deviceInfo) {
    await this.addLog(userId, "USER_DEVICE_ADDED", deviceInfo);
  },

  // Restaurant related logs
  async restaurantCreation(userId, restaurantId, restaurantName) {
    await this.addLog(userId, "RESTAURANT_CREATION", { restaurantId, restaurantName });
  },

  async restaurantUpdate(userId, restaurantId, updatedFields) {
    await this.addLog(userId, "RESTAURANT_UPDATE", { restaurantId, updatedFields });
  },

  async restaurantDelete(userId, restaurantId) {
    await this.addLog(userId, "RESTAURANT_DELETE", { restaurantId });
  },

  // Item related logs
  async itemCreation(userId, itemId, itemName, restaurantId) {
    await this.addLog(userId, "ITEM_CREATION", { itemId, itemName, restaurantId });
  },

  async itemUpdate(userId, itemId, updatedFields) {
    await this.addLog(userId, "ITEM_UPDATE", { itemId, updatedFields });
  },

  async itemDelete(userId, itemId, restaurantId) {
    await this.addLog(userId, "ITEM_DELETE", { itemId, restaurantId });
  },

  async itemAvailabilityChange(userId, itemId, isAvailable) {
    await this.addLog(userId, "ITEM_AVAILABILITY_CHANGE", { itemId, isAvailable });
  },

  // Order related logs
  async orderCreation(userId, orderId, totalAmount) {
    await this.addLog(userId, "ORDER_CREATION", { orderId, totalAmount });
  },

  async orderStatusUpdate(userId, orderId, newStatus) {
    await this.addLog(userId, "ORDER_STATUS_UPDATE", { orderId, newStatus });
  },

  async orderCancellation(userId, orderId) {
    await this.addLog(userId, "ORDER_CANCELLATION", { orderId });
  },

  // Delivery related logs
  async deliveryAssignment(userId, orderId, deliveryUserId) {
    await this.addLog(userId, "DELIVERY_ASSIGNMENT", { orderId, deliveryUserId });
  },

  async deliveryStatusUpdate(userId, orderId, newStatus) {
    await this.addLog(userId, "DELIVERY_STATUS_UPDATE", { orderId, newStatus });
  },

  // Review and rating logs
  async reviewSubmission(userId, restaurantId, rating) {
    await this.addLog(userId, "REVIEW_SUBMISSION", { restaurantId, rating });
  },

  // Search logs
  async userSearch(userId, searchQuery) {
    await this.addLog(userId, "USER_SEARCH", { searchQuery });
  },

  // Payment logs
  async paymentProcessed(userId, orderId, amount) {
    await this.addLog(userId, "PAYMENT_PROCESSED", { orderId, amount });
  },

  // Admin actions
  async adminAction(userId, actionType, details) {
    await this.addLog(userId, "ADMIN_ACTION", { actionType, ...details });
  },

  // Fetch logs
  async getLogs(filters = {}, sort = { timestamp: -1 }, limit = 100, skip = 0) {
    try {
      const logs = await Log.find(filters)
        .sort(sort)
        .limit(limit)
        .skip(skip)
        .populate('user', 'username');
      return logs;
    } catch (error) {
      console.error("Error fetching logs:", error);
      throw error;
    }
  },


  getUserActivities: async (userId, page = 1, limit = 10) => {
    try {
      const activities = await Log.find({ user: userId })
        .sort({ timestamp: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('user', 'username');
      return activities;
    } catch (error) {
      console.error('Error fetching user activities:', error);
      throw error;
    }
  }
};

module.exports = logService;


















