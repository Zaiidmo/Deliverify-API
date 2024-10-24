const Restaurant = require("../models/Restaurant");
const Item = require("../models/Item");

const search = async (req, res) => {
  try {
    const { query } = req.query;

    // Check if the query is provided
    if (!query) {
      return res.status(400).json({ message: "Please provide a search query" });
    }

    // Sanitize the query if needed (optional)
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
