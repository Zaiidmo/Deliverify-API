const Item = require("../models/Item");
const Restaurant = require("../models/Restaurant");
const User = require("../models/User");
const logService  = require("../services/logService");

const getItems = async (req, res) => {
  try {
    const items = await Item.find();
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getItemById = async (req, res) => {
  const { id } = req.params;

  try {
    const item = await Item.findById(id);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }
    res.status(200).json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ge all items by restaurantid
const getItemsByRestaurant = async (req, res) => {
  const { id } = req.params;

  try {
    const items = await Item.find({ restaurant: id });
    if (!items) {
      return res.status(404).json({ message: "Items not found" });
    }
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



const createItem = async (req, res) => {
  const { name, description, price, category, image, restaurant, available } =
    req.body;

  try {
    const item = new Item({
      name,
      description,
      price,
      category,
      image,
      restaurant,
      available,
    });

    await item.save();

    try {
      const user = await User.findById(req.user._id);
      await logService.addLog( user._id ,"CREATE_ITEM",{user : user._id,ip : req.ip, username : user.username, fullname : user.fullname.fname + " " + user.fullname.lname});
    } catch (logError) {
      console.error("Error durring add user action to Logs :", logError);
    }

    res.status(201).json({ message: "Item created successfully", item });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateItem = async (req, res) => {
  const { id } = req.params;
  const { name, description, price, category, image, restaurant, available } =
    req.body;

  try {
    const item = await Item.findByIdAndUpdate(id, {
      name,
      description,
      price,
      category,
      image,
      restaurant,
      available,
    });

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    try { 
      const user = await User.findById(req.user._id); 
      await logService.addLog( user._id ,"UPDATE_ITEM",{user : user._id,ip : req.ip, username : user.username, fullname : user.fullname.fname + " " + user.fullname.lname});
    } catch (logError) {
      console.error("Error durring add user action to Logs :", logError);
    }

    res.status(200).json({ message: "Item updated successfully", item });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const changeTheAvailabality = async (req, res) => {
  // change the availability to true or false
  const { id } = req.params;

  try {
    const item = await Item.findById(id);

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    item.available = !item.available;

    await item.save();

    try {
      const user = await User.findById(req.user._id);
      await logService.addLog( user._id ,"UPDATE_ITEM_CHANGE_AVAILABILITY",{user : user._id,ip : req.ip, username : user.username, fullname : user.fullname.fname + " " + user.fullname.lname});
    } catch (logError) {
      console.error("Error durring add user action to Logs :", logError);
    }

    res
      .status(200)
      .json({ message: "Item availability updated successfully", item });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteItem = async (req, res) => {
  const { id } = req.params;

  try {
    const item = await Item.findByIdAndDelete(id);

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    try {
      const user = await User.findById(req.user._id);
      await logService.addLog( user._id ,"DELETE_ITEM",{user : user._id,ip : req.ip, username : user.username, fullname : user.fullname.fname + " " + user.fullname.lname});
    } catch (logError) {
      console.error("Error durring add user action to Logs :", logError);
    }



    res.status(200).json({ message: "Item deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
  changeTheAvailabality,
  getItemsByRestaurant,
};
