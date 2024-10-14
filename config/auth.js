const dotenv = require("dotenv");

dotenv.config();

module.exports = {
    jwtSecret: process.env.JWT_SECRET,
    jwtExpire: process.env.JWT_EXPIRES_IN,
    jwtRememberMe: process.env.JWT_REMEMBER_ME_EXPIRES_IN,
};