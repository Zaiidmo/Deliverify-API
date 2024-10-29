const Restaurant = require('../models/Restaurant');
const User = require('../models/User');

class RestaurantService {
  async createRestaurant(data, ownerId) {
    try {
      const owner = await User.findById(ownerId);
      if (!owner) throw new Error('Owner not found');

      const restaurant = new Restaurant({ ...data, owner: ownerId });
      await restaurant.save();
      return restaurant;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async getAllRestaurants() {
    try {
      return await Restaurant.find().populate('owner');
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async updateRestaurant(restaurantId, data) {
    try {
      const restaurant = await Restaurant.findByIdAndUpdate(restaurantId, data, { new: true });
      if (!restaurant) throw new Error('Restaurant not found');
      return restaurant;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async deleteRestaurant(restaurantId) {
    try {
      const restaurant = await Restaurant.findByIdAndUpdate(restaurantId, { isDeleted: true });
      if (!restaurant) throw new Error('Restaurant not found');
      return restaurant;
    } catch (error) {
      throw new Error(error.message);
    }
  }
  
  async assignManager(restaurantId, userId) {
    try {
      const restaurant = await Restaurant.findById(restaurantId);
      if (!restaurant) throw new Error('Restaurant not found');
      
      restaurant.owner = userId;
      await restaurant.save();
      return restaurant;
    } catch (error) {
      throw new Error(error.message);
    }
  }
}

module.exports = new RestaurantService();
