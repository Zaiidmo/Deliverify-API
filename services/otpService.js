const crypto = require('crypto');

const otps = {};

// Generate OTP
const generateOTP = () => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    return otp;
};

//Store the generated OTP in memory with an expiration time 
const storeOTP = (email, otp) => {
    const expires = Date.now() + 5 * 60 * 1000; // 5 minutes
    otps[email] = { otp, expires };
}

// Validate the OTP 
const verifyOTP = (email, otp) => {
   const record = otps[email];
    if (!record) {
         return false;
    }

    const { otp: storedOTP, expires } = record;

    //Check if OTP is valid and not expired
    const isValid = storedOTP === otp && Date.now() < expires;

    // Remove OTP after validation 
    if(isValid) {
        delete otps[email];
    }

    return isValid;
}

module.exports = {  generateOTP, storeOTP, verifyOTP };

