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
  logo: restaurant.logo || 'default-restaurant.jpg', 
  cover: restaurant.cover || 'default-restaurant-cover.jpg',
  images: restaurant.images || [], 
  category: restaurant.category,
  openAt: restaurant.openAt,
  closeAt: restaurant.closeAt,
  owner: restaurant.owner
};
  }catch (error){
    throw new Error (error.message);
  }

};

const updateRestaurantById = async (id , updateData) => {
  try {
    const restaurant = await Restaurant.findById(id);
    if(!restaurant){
      throw new Error('Restaurant non trouvé');
    }
    restaurant.name = updateData.name ?? restaurant.name;
    restaurant.address = updateData.address ?? restaurant.address;
    restaurant.phoneNumber = updateData.phoneNumber ?? restaurant.phoneNumber;
    restaurant.logo = updateData.logo ?? restaurant.logo;
    restaurant.cover= updateData.cover ?? restaurant.cover;
    restaurant.images = updateData.images.length > 0 ? updateData.images : restaurant.images;
    restaurant.openAt = updateData.openAt ?? restaurant.openAt;
    restaurant.closeAt = updateData.closeAt ?? restaurant.closeAt;
    restaurant.category = updateData.category ?? restaurant.category;
    

    await restaurant.save();

    return restaurant;
  }catch (error){
    throw new Error (error.message);
  }
};

const softDeleteRestaurant = async (id) =>{
  try{
    const restaurant = await Restaurant.findById(id);
    if(!restaurant){
      throw new Error('Restaurant non trouvé');
    }

    restaurant.isDeleted = true;
    await restaurant.save();
    return restaurant;
  }catch (error){
    throw new Error(error.message)
  }
}
module.exports = {
  createRestaurant,
  getAllRestaurants,
  getRestaurantById,
  updateRestaurantById,
  softDeleteRestaurant,
};
