const Restaurant = require("../models/Restaurant");
const Item = require("../models/Item");
const logService = require("../services/logService");

const GUEST_USER = {
  _id: "guest_user", // Use a string here for easy logging, but don't save this to DB as an ObjectId
  username: "Guest",
  fullname: {
    fname: "Guest",
    lname: "User",
  },
};



const search = async (req, res) => {
  try {
    // Get the search query from the request body
    const { query } = req.body;

    // Determine user details for logging
    const userId = req.user ? req.user._id : GUEST_USER._id;
    const username = req.user ? req.user.username : GUEST_USER.username;
    const fullname = req.user
      ? `${req.user.fullname.fname} ${req.user.fullname.lname}`
      : `${GUEST_USER.fullname.fname} ${GUEST_USER.fullname.lname}`;

    const logDetails = {
      searchFor: query || "No query provided",
      ip: req.ip,
      username,
      fullname,
    };

    // Log the search action
    await logService.addLog(userId, "SEARCH", logDetails);

    // If no query is provided, return an appropriate response
    if (!query) {
      return res.status(400).json({ message: "Please provide a search query" });
    }

    // Sanitize the query if needed
    const sanitizedQuery = query.replace(/[^a-zA-Z0-9\s]/g, "");

    // Search restaurants by name
    const restaurants = await Restaurant.find({
      name: {
        $regex: sanitizedQuery,
        $options: "i",
      },
    });

    // Search items by name
    const items = await Item.find({
      name: {
        $regex: sanitizedQuery,
        $options: "i",
      },
    });

    res.status(200).json({
      totalRestaurants: restaurants.length,
      totalItems: items.length,
      restaurants,
      items,
    });
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  search,
};
