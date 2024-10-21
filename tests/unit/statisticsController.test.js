const { getAllStatisticsResto } = require("../../controllers/statisticsManagerController");
const statisticManagerService = require("../../services/statisticManagerService");

jest.mock("../../services/statisticManagerService");

describe("Statistics Controller", () => {
  describe("getOwnerStatistics", () => {
    it("should return statistics for an owner", async () => {
      const req = { params: { ownerId: "ownerId1" }, user: { _id: "ownerId1" } }; 
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      const mockStatistics = {
        totalRestaurants: 2,
        restaurantStats: [
          {
            restaurantId: "restoId1",
            restaurantName: "Resto 1",
            totalCancelledOrders: 5,
            totalDeliveredOrders: 10,
            totalReportedOrders: 1,
            totalRevenue: 200,
            totalOrders: 16,
            itemsSold: [],
          },
        ],
      };

      statisticManagerService.getStatisticByOwner.mockResolvedValue(mockStatistics); 

      await getAllStatisticsResto(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockStatistics,
      });
    });

    it("should return an error if statistics retrieval fails", async () => {
      const req = { params: { ownerId: "ownerId1" }, user: { _id: "ownerId1" } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      statisticManagerService.getStatisticByOwner.mockRejectedValue(new Error("Error retrieving statistics")); // Mock l'erreur du service

      await getAllStatisticsResto(req, res); 

      expect(res.status).toHaveBeenCalledWith(500); 
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Error retrieving statistics",
      });
    });
  });
});
