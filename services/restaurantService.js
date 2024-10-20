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
};

const getRestaurantById = async(id) =>{
  try {
const restaurant = await Restaurant.findById(id);
if(!restaurant){
  throw new Error ('Restaurant non trouvé');
}
return{
  _id: restaurant._id,
  name: restaurant.name,
  address: restaurant.address,
  phoneNumber: restaurant.phoneNumber,
  logo: restaurant.logo || 'default-restaurant.jpg', // valeur par défaut
  cover: restaurant.cover || 'default-restaurant-cover.jpg', // valeur par défaut
  images: restaurant.images || [], // tableau vide par défaut
  category: restaurant.category,
  openAt: restaurant.openAt,
  closeAt: restaurant.closeAt,
  owner: restaurant.owner
};
  }catch (error){
    throw new Error (error.message);
  }

};
module.exports = {
  createRestaurant,
  getAllRestaurants,
  getRestaurantById,
};
