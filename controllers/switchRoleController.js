const Role = require("../models/Role");
const User = require("../models/User");

const switchRoleToDelivery = async (req, res) => {
  const { id } = req.params; 
  const deliveryRole = await Role.findOne({ name: "Delivery" });

  try {
    // Find the user by ID
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Switch the user's role to Delivery
    user.roles = [deliveryRole._id]; 
    await user.save(); 

    return res.status(200).json({ message: "Role switched to Delivery", user });
  } catch (error) {
    console.error("Error switching role: ", error);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = { switchRoleToDelivery };

