const Restaurant = require("../models/Restaurant");
const User = require("../models/User");

const createRestaurantService = async (restaurantData) => {
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



module.exports = {
  createRestaurantService,
};
