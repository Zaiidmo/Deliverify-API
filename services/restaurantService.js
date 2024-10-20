const Restaurant = require("../models/Restaurant");
const User = require("../models/User");

const createRestaurant= async (restaurantData) => {
  const { name, address, phoneNumber, logo, cover, images, location, openAt, closeAt, category, owner } = restaurantData;

  const ownerExists = await User.findById(owner);
  if (!ownerExists) {
    throw new Error("Propriétaire non trouvé");
  }

  const newRestaurant = new Restaurant({
    name,
    address,
    phoneNumber,
    logo: logo ?? "default-restaurant.jpg", 
    cover: cover ?? "default-cover.jpg", 
    images: images ?? [],
    location,
    openAt,
    closeAt,
    category,
    owner,
  });

  await newRestaurant.save();

  return newRestaurant;
};


const getAllRestaurants = async() => {
  const restaurants = await Restaurant.find();
  return restaurants.map(restaurant => ({
    ...restaurant,
    logo: restaurant.logo || 'default-restaurant.jpg', 
    cover: restaurant.cover || 'default-restaurant-cover.jpg',
    images: restaurant.images.length > 0 ? restaurant.images : [] 
  }));
}
module.exports = {
  createRestaurant,
  getAllRestaurants,
};
