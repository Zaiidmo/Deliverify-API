const jwt = require('jsonwebtoken');

// Generate JWT for verification
const generateVerificationToken = (userId) => {
    // Use the user ID as the payload
    const payload = { _id: userId };  
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
};

// Generate JWT for login
const generateAccessToken = (userId) => {
    // Use the user ID as the payload
    const payload = { _id: userId };  
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_LOGIN_TOKEN_EXPIRES_IN });
};

// Generate refresh token
const generateRefreshToken = (user) => {
    const payload = { _id: user._id };
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_LOGIN_TOKEN_EXPIRES_IN });
};

// Generate Remember Me token
const generateRememberMeToken = (userId) => {
    const payload = { _id: userId };  
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_REMEMBER_ME_EXPIRES_IN });
};
// Verify the token
const verifyToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
        console.error("Invalid or expired token:", err.message);
        return null;
    }
};


module.exports = {
    generateVerificationToken,
    generateAccessToken,
    verifyToken,
    generateRefreshToken,
    generateRememberMeToken,
};
