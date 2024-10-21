const Item = require("../models/Item");
const Restaurant = require("../models/Restaurant");
const User = require("../models/User");

const getItems = async (req, res) => {
    // item by userId
    
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

// getitems by restaurant
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
    const { name, description, price, category, image, restaurant, available } = req.body;

    try {
        const item = new Item({
            name,
            description,
            price,
            category,
            image,
            restaurant,
            available
        });
        await item.save();
        res
          .status(201)
          .json({ message: "Item created successfully", item: item });

    } catch (error) {
        res.status(500).json({ message: error.message });

    }
};

const updateItem = async (req, res) => {
    const { id } = req.params;
    const { name, description, price, category, image, restaurant, available } = req.body;

    try {
        const item = await Item.findByIdAndUpdate(id, {
            name,
            description,
            price,
            category,
            image,
            restaurant,
            available
        });

        if (!item) {
            return res.status(404).json({ message: "Item not found" });
        }

        res.status(200).json({ message: "Item updated successfully", item });

    } catch (error) {
        res.status(500).json({ message: error.message });

    };
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

        res.status(200).json({ message: "Item availability updated successfully", item });

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
  getItemsByRestaurant
};
