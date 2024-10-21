const Item = require("../models/Item");
const Restaurant = require("../models/Restaurant");

const createRestaurantWithItems = async (req, res) => {
  try {
    const restaurant = new Restaurant(req.bady);
    await restaurant.save();
    // create items for that restaurant
    for (let i = 0; i < req.body.items.length; i++) {
      const item = new Item(req.bady.item[i]);
      item.restaurant = restaurant._id;
      await item.save();
    }
    res
      .status(201)
      .json({ message: "Restaurant created successfully", restaurant });
  } catch (error) {
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
