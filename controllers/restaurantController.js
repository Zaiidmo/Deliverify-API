const { createRestaurantService } = require("../services/restaurantService");

const createRestaurant = async (req, res) => {
  console.log("Received request to create restaurant:", req.body);
  try {
    const restaurantData = req.body;

    const newRestaurant = await createRestaurantService(restaurantData);

    res.status(201).json({
      message: "Restaurant créé avec succès",
      restaurant: newRestaurant,
    });
  } catch (error) {
    console.error("Erreur lors de la création du restaurant :", error.message);

    res.status(500).json({ message: error.message || "Erreur serveur" });
  }
};

module.exports = { createRestaurant };
