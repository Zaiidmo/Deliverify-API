const User = require('../models/User'); 
const jwtService = require('../services/jwtService')

const isSeller = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        const decoded = jwtService.verifyToken(token)
        if(!decoded){
            return res.status(401).json({message: 'Unauthorized: No Token Provided'})
        }

        const foundUser = await User.findById(decoded._id).populate('roles');
        if (!foundUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if the user has the 'seller' role
        const hasSellerRole = foundUser.roles.some(role => role.name === 'Seller');

        if (!hasSellerRole) {
            return res.status(403).json({ message: 'Access denied: Sellers only' });
        }

        next();
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = { isSeller };
