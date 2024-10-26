const Item = require("../models/Item");
const Restaurant = require("../models/Restaurant");
const User = require("../models/User");
const logService  = require("../services/logService");

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

      try {
        const user = await User.findById(req.user._id);
        await logService.addLog( user._id ,"ADD_ITEMs_TO_RESTAURANT",{restaurant: restaurantId, user : user._id,ip : req.ip, fullname : user.fullname.fname + " " + user.fullname.lname});
      } catch (logError) {
        console.error("Error durring add user action to Logs :", logError);
      }

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
