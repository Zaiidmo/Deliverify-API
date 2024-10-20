const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const { purchase, getOrderStatus } = require('../controllers/orderController');

// Define a function that takes io and passes it to the controller
module.exports = (io) => {
    router.post('/purchase', authMiddleware, (req, res) => purchase(req, res, io)); 
    router.get('/history', authMiddleware, (req, res) => getOrderStatus(req, res));
    return router;
};
