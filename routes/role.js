// routes/roleRoutes.js
const express = require('express');
const {
    createRole,
    assignPermissions,
    assignRoles,
    getAllRoles,
    getAllPermissions
} = require('../controllers/roleController');
const authMiddleware = require('../middlewares/authMiddleware');
const { isAdmin } = require('../middlewares/adminMiddleware');

const router = express.Router();

// Use authentication and admin middleware for all role routes
router.use(authMiddleware, isAdmin);

// Route to create a new role
router.post('/create', createRole);

// Route to assign permissions to a role
router.post('/assign-permissions', assignPermissions);

// Route to assign roles to a user
router.post('/assign-roles', assignRoles);

// Route to get all roles
router.get('/', getAllRoles);

router.get('/permissions', getAllPermissions);

module.exports = router;
