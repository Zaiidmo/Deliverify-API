const bcrypt = require('bcryptjs');
const User = require('../models/User');

const hashPassword = async (password) => {
    if (typeof password !== 'string') {
        throw new Error('Password must be a string');
    }
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
};

const comparePassword = async (enteredPassword, userPassword) => {
    return await bcrypt.compare(enteredPassword, userPassword);
};

const updatePassword = async (userId, newPassword) => {
  // Hash the new password (use your hashing method here)
  const hashedPassword = await hashPassword(newPassword); // Example of a password hashing function
  
  // Find the user and update the password
  const user = await User.findById(userId); // Ensure User model is defined
  if (!user) {
    throw new Error("User not found.");
  }
  
  user.password = hashedPassword; // Update the password field
  await user.save(); // Save the updated user

  return user; // Return the updated user object
};

module.exports = {
    hashPassword,
    comparePassword,
    updatePassword,
};
