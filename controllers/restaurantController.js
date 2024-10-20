const restaurantService = require("../services/restaurantService");

const createRestaurant = async (req, res) => {
  console.log("Received request to create restaurant:", req.body);
  try {
    const restaurantData = req.body;

    const newRestaurant = await restaurantService.createRestaurant(restaurantData);

    res.status(201).json({
      message: "Restaurant créé avec succès",
      restaurant: newRestaurant,
    });
  } catch (error) {
    console.error("Erreur lors de la création du restaurant :", error.message);

    res.status(500).json({ message: error.message || "Erreur serveur" });
  }
};

const getAllRestaurants = async (req,res) => {
try{
  const restaurants = await restaurantService.getAllRestaurants();
  return res.status(200).json(restaurants);
}catch(error) {
  return res.status(500).json({error : error.message});

}
};

const getRestaurantById = async (req, res) =>{
const {id} = req.params;
try {
  const restaurant = await restaurantService.getRestaurantById(id);
  return res.status(200).json(restaurant);
}catch (error) {return res.status(404).json({ error: error.message});

}
};

module.exports = {
   createRestaurant,
   getAllRestaurants, 
   getRestaurantById,
  };
