const Restaurant = require("../models/Restaurant");
const Order = require("../models/Order");

const getStatisticByOwner = async (owneId) => {
try{
    const restaurant = await Restaurant.find({ owner:  owneId});
    if(restaurant.length === 0){
        throw new Error("Aucun restaurant trouvé pour ce proprietaire.");
    }

    const restaurantIds = restaurant.map((restaurant) => restaurant._id);

    const orderStats = await Order.aggregate([
        {
            $match: {
                restaurant:{ $in: restaurantIds},
                status: { $in: ["Cancelled", "Delivered", "Reported"]},
            },
        },
        {
            $group: {
                _id: {
                    restaurant: "$restaurant",
                    status: "$status",
                },
                totalOrders: {$sum: 1},
                totalRevenue: {
                    $sum: { $cond: [{ $eq: ["$status","Delivered"]}, "$totalAmount",0]}
                },
            },
        },
    ]);
    const restaurantStats = await Promise.all(restaurants.map(async (restaurant) => {
        const restaurantId = restaurant._id;
  
        const cancelledOrders = orderStats.find(
          (stat) => stat._id.restaurant.toString() === restaurantId.toString() && stat._id.status === "Cancelled"
        )?.totalOrders || 0;
  
        const deliveredOrders = orderStats.find(
          (stat) => stat._id.restaurant.toString() === restaurantId.toString() && stat._id.status === "Delivered"
        )?.totalOrders || 0;
  
        const reportedOrders = orderStats.find(
          (stat) => stat._id.restaurant.toString() === restaurantId.toString() && stat._id.status === "Reported"
        )?.totalOrders || 0;
  
        const totalRevenue = orderStats.find(
          (stat) => stat._id.restaurant.toString() === restaurantId.toString() && stat._id.status === "Delivered"
        )?.totalRevenue || 0;
  
        
        const itemsStats = await Order.aggregate([
          {
            $match: {
              restaurant: restaurantId,
              status: "Delivered",
            },
          },
          {
            $unwind: "$items",
          },
          {
            $group: {
              _id: "$items.item",
              totalSold: { $sum: "$items.quantity" },
            },
          },
          {
            $lookup: {
              from: "items",
              localField: "_id",
              foreignField: "_id",
              as: "itemDetails",
            },
          },
          {
            $unwind: "$itemDetails",
          },
          {
            $project: {
              _id: 0,
              itemId: "$_id",
              itemName: "$itemDetails.name",
              totalSold: 1,
            },
          },
        ]);
  
        return {
          restaurantId: restaurant._id,
          restaurantName: restaurant.name,
          totalCancelledOrders: cancelledOrders,
          totalDeliveredOrders: deliveredOrders,
          totalReportedOrders: reportedOrders,
          totalRevenue,
          totalOrders: cancelledOrders + deliveredOrders + reportedOrders,
          itemsSold: itemsStats, 
        };
      }));
  
      return {
        totalRestaurants: restaurant.length,
        restaurantStats,
      };
    } catch (error) {
      throw new Error(error.message);
    }
  };
module.exports = {
    getStatisticByOwner,
};
