// route for manage meals
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const { createRestaurantWithItems, addItemsToRestaurant } = require('../controllers/manageMealsController');

// create restaurant with items
router.post('/create-restaurant-with-items', authMiddleware, createRestaurantWithItems);

// add items to restaurant
router.post('/add-items-to-restaurant', authMiddleware, addItemsToRestaurant);

module.exports = router
