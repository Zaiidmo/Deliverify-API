const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const {purchase} = require('../controllers/orderController');

// Purchase Route
router.post('/purchase', purchase);

module.exports = router;