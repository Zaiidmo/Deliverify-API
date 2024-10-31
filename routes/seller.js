const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const { isSeller } = require('../middlewares/sellerMiddleware');
const { getClientOrders } = require('../controllers/orderController');
const router = express.Router();


// Use authentication and seller middleware for all seller routes
router.use(authMiddleware, isSeller);

// Get Client's Orders
router.get('/:id', getClientOrders);

module.exports = router;
