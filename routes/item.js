// route for manageItemController 

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const { getItems, getItemById, createItem, updateItem, deleteItem, changeTheAvailabality } = require('../controllers/manageItemController');

// get all items
router.get('/', getItems);

// get item by id
router.get('/:id', getItemById);

// create item
router.post('/createItem', authMiddleware, createItem);

// update item
router.put('/updateItem/:id', authMiddleware, updateItem);

// delete item
router.delete('/deleteItem/:id', authMiddleware, deleteItem);

// change the availability
router.put('/changeTheAvailabality/:id', authMiddleware, changeTheAvailabality);

module.exports = router