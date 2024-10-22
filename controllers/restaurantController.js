const restaurantService = require("../services/restaurantService");
const User = require("../models/User")
const jwtService = require("../services/jwtService")
const Item = require("../models/Item")
const statisticManager = require("../services/statisticManagerService");


const createRestaurant = async (req, res) => {
  console.log("Received request to create restaurant:", req.body);
  try {
    const token =
      req.headers.authorization && req.headers.authorization.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Unauthorized: Missing token" });
    }

    const decoded = jwtService.verifyToken(token, process.env.JWT_SECRET);
    if (!decoded) {
      return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }

    const user = await User.findById(decoded._id);
    const restaurantData = req.body;
    restaurantData.owner = user;

    const newRestaurant = await restaurantService.createRestaurant(
      restaurantData
    );

    res.status(201).json({
      message: "Restaurant créé avec succès",
      restaurant: newRestaurant,
    });
  } catch (error) {
    console.error("Erreur lors de la création du restaurant :", error.message);

    res.status(500).json({message: "Erreur serveur"} );
  }
};

const createRestaurantWithItems = async (req, res) => {
  try {
    // Extract restaurant details and items from the request body
    const { items, ...restaurantData } = req.body;

    // Create and save the restaurant
    const restaurant = await restaurantService.createRestaurant(restaurantData)
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

const getAllRestaurants = async (req, res) => {
  try {
    const restaurants = await restaurantService.getAllRestaurants();
    return res.status(200).json(restaurants);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getRestaurantById = async (req, res) => {
  const { id } = req.params;
  try {
    const restaurant = await restaurantService.getRestaurantById(id);
    return res.status(200).json(restaurant);
  } catch (error) {
    return res.status(404).json({ error: error.message });
  }
};

const updateRestaurant = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedRestaurant = await restaurantService.updateRestaurantById(
      id,
      updateData
    );
    return res.status(200).json(updatedRestaurant);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
const deleteRestaurant = async (req, res) => {
  try {
    const restaurantId = req.params.id;
    const restaurant = await restaurantService.softDeleteRestaurant(
      restaurantId
    );
    res
      .status(200)
      .json({
        message: "Restaurant marqué comme supprimé avec succès",
        restaurant,
      });
  } catch (error) {
    res
      .status(500)
      .json({
        message:
          error.message || "erreur lors de la suppression du restaurant ",
      });
  }
};

const getAllStatisticsResto = async (req, res) => {
  try{
      const ownerId = req.user._id;
      const stats = await statisticManager.getStatisticByOwner(ownerId);
      return res.status(200).json({
          success: true,
          data: stats,
      });
  } catch (error) {
      return res.status(500).json({
          success: false,
          message: error.message,
      });
  }
  };
module.exports = {
  createRestaurant,
  getAllRestaurants,
  getRestaurantById,
  updateRestaurant,
  deleteRestaurant,
  createRestaurantWithItems,
  getAllStatisticsResto,
};
