const Restaurant = require("../models/Restaurant");
const User = require("../models/User");

const createRestaurant = async (restaurantData) => {
  const {
    name,
    address,
    phoneNumber,
    logo,
    cover,
    images,
    location,
    openAt,
    closeAt,
    category,
    owner,
  } = restaurantData;

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

const getAllRestaurants = async () => {
  const restaurants = await Restaurant.find({
    isDeleted: false,
    isApprouved: true,
  });
  return restaurants;
};

const getRestaurantById = async (id) => {
  try {
    const restaurant = await Restaurant.findById({ _id: id, isDeleted: false });

    if (!restaurant) {
      throw new Error("Restaurant non trouvé");
    }

    return {
      restaurant: restaurant,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

const updateRestaurantById = async (id, updateData) => {
  try {
    const restaurant = await Restaurant.findById(id);
    if (!restaurant) {
      throw new Error("Restaurant non trouvé");
    }
    restaurant.name = updateData.name ?? restaurant.name;
    restaurant.address = updateData.address ?? restaurant.address;
    restaurant.phoneNumber = updateData.phoneNumber ?? restaurant.phoneNumber;
    restaurant.logo = updateData.logo ?? restaurant.logo;
    restaurant.cover = updateData.cover ?? restaurant.cover;
    restaurant.images = updateData.images
      ? updateData.images
      : restaurant.images;
    restaurant.openAt = updateData.openAt ?? restaurant.openAt;
    restaurant.closeAt = updateData.closeAt ?? restaurant.closeAt;
    restaurant.category = updateData.category ?? restaurant.category;

    await restaurant.save();

    return restaurant;
  } catch (error) {
    throw new Error(error.message);
  }
};

const softDeleteRestaurant = async (id) => {
  try {
    const restaurant = await Restaurant.findById(id);
    if (!restaurant) {
      throw new Error("Restaurant non trouvé");
    }

    restaurant.isDeleted = true;
    await restaurant.save();
    return restaurant;
  } catch (error) {
    throw new Error(error.message);
  }
};

const acceptRestaurant = async (id) => {
  try {
    const restaurant = await Restaurant.findById(id);
    if (!restaurant) {
      throw new Error("Restaurant non trouvé");
    }

    restaurant.isApprouved = true;
    await restaurant.save();
    return restaurant;
  } catch (error) {
    throw new Error(error.message);
  }
};

const getAdminRestaurants = async () => {
  const restaurants = await Restaurant.find({ isDeleted: false }).select(
    "name owner isApprouved isDeleted "
  );
  for (let i = 0; i < restaurants.length; i++) {
    const owner = await User.findById(restaurants[i].owner).select("username email");
    restaurants[i].owner = owner;
  }
  // console.log(restaurants);
  return restaurants;
};
module.exports = {
  createRestaurant,
  getAllRestaurants,
  getRestaurantById,
  updateRestaurantById,
  softDeleteRestaurant,
  acceptRestaurant,
  getAdminRestaurants,
};
