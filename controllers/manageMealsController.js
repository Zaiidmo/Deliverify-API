const Item = require("../models/Item");
const Restaurant = require("../models/Restaurant");

const createRestaurantWithItems = async (req, res) => {
  try {
    // Extract restaurant details and items from the request body
    const { items, ...restaurantData } = req.body;

    // Create and save the restaurant
    const restaurant = new Restaurant(restaurantData);
    await restaurant.save();

    // Create and save each item linked to the newly created restaurant
    for (let i = 0; i < items.length; i++) {
      const item = new Item({
        ...items[i],
        restaurant: restaurant._id,
      });
      await item.save();
    }

    // Return a success response
    res.status(201).json({
      message: "Restaurant and items created successfully",
      restaurant,
    });
  } catch (error) {
    // Handle errors and return an error response
    res.status(500).json({ message: error.message });
  }
};

const addItemsToRestaurant = async (req, res) => {
  try {
    const { restaurantId, items } = req.body;

    for (let i = 0; i < items.length; i++) {
      const item = new Item({
        name: items[i].name,
        description: items[i].description,
        price: items[i].price,
        category: items[i].category,
        image: items[i].image,
        restaurant: restaurantId,
      });

      await item.save();
    }

    res.status(201).json({ message: "Items added successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createRestaurantWithItems,
  addItemsToRestaurant,
};
