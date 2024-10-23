const User = require('../models/User'); 
const jwtService = require('../services/jwtService')

const isAdmin = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        const decoded = jwtService.verifyToken(token)
        if(!decoded){
            return res.status(401).json({message: 'Unauthorized: No Token Provided'})
        }

        // Fetch user from the database to ensure we have the latest roles
        const foundUser = await User.findById(decoded._id).populate('roles');
        if (!foundUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if the user has the 'admin' role
        const hasAdminRole = foundUser.roles.some(role => role.name === 'Admin');

        if (!hasAdminRole) {
            return res.status(403).json({ message: 'Access denied: Admins only' });
        }

        next();
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = { isAdmin };
