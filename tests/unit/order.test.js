const orderController = require("../../controllers/orderController");
const jwtService = require("../../services/jwtService");
const mollieService = require("../../services/mollieService");
const socketService = require("../../services/socketService");
const Order = require("../../models/Order");
const User = require("../../models/User");
const Item = require("../../models/Item");

// Mock dependencies
jest.mock("../../services/jwtService");
jest.mock("../../services/mollieService");
jest.mock("../../models/Order");
jest.mock("../../models/User");
jest.mock("../../models/Item");
jest.mock("../../services/socketService");

describe("Order Controller - Purchase Function", () => {
  let req, res;

  beforeEach(() => {
    req = {
      headers: {
        authorization: "Bearer valid_token",
      },
      body: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("purchase", () => {
    it("should successfully place an order for valid data and notify delivery persons", async () => {
      req.body = {
        items: [
          { itemId: "item1_id", quantity: 2 },
          { itemId: "item2_id", quantity: 1 },
        ],
      };

      const mockUser = { _id: "user_id", username: "john_doe" };
      const mockItem1 = { _id: "item1_id", price: 10 };
      const mockItem2 = { _id: "item2_id", price: 15 };
      const mockPayment = {
        id: "payment_id",
        _links: { checkout: { href: "payment_link" } },
      };

      jwtService.verifyToken.mockReturnValue(mockUser);
      User.findById.mockResolvedValue(mockUser);
      Item.findById.mockImplementation((id) => {
        if (id === "item1_id") return Promise.resolve(mockItem1);
        if (id === "item2_id") return Promise.resolve(mockItem2);
        return Promise.resolve(null);
      });
      mollieService.createPayment.mockResolvedValue(mockPayment);

      await orderController.purchase(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Order placed successfully",
          order: expect.any(Object),
          paymentLink: "payment_link",
        })
      );
      expect(socketService.notifyDeliveryPersons).toHaveBeenCalled(); // Check if socket notification was sent
    });

    it('should return 401 if token is missing', async () => {
        req.headers.authorization = undefined;

        await orderController.purchase(req, res);

        expect(res.status).toHaveBeenCalledWith(401); 
        expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized: Missing token' }); 
    });
    
    it("should return 401 if token is invalid", async () => {
      jwtService.verifyToken.mockReturnValue(null);

      await orderController.purchase(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: "Unauthorized: Invalid token" });
    });

    it("should return 401 if user does not exist", async () => {
      const mockUser = { _id: "user_id" };
      jwtService.verifyToken.mockReturnValue(mockUser);
      User.findById.mockResolvedValue(null);

      await orderController.purchase(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: "Unauthorized: User not found" });
    });

    it("should return 400 if order items are invalid", async () => {
      req.body = { items: [] }; // No items

      const mockUser = { _id: "user_id" };
      jwtService.verifyToken.mockReturnValue(mockUser);
      User.findById.mockResolvedValue(mockUser);

      await orderController.purchase(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Invalid order data: No items provided" });
    });

    it("should return 400 if an item is not found", async () => {
      req.body = {
        items: [{ itemId: "item1_id", quantity: 2 }],
      };

      const itemId = req.body.items[0].itemId;
      const mockUser = { _id: "user_id" };
      jwtService.verifyToken.mockReturnValue(mockUser);
      User.findById.mockResolvedValue(mockUser);
      Item.findById.mockImplementation(() => Promise.resolve(null)); // Item not found

      await orderController.purchase(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: `Invalid item data: Item ${itemId} not found`,
      });
    });

    it("should return 500 if an error occurs", async () => {
      req.body = {
        items: [{ itemId: "item1_id", quantity: 1 }],
      };

      const mockUser = { _id: "user_id" };
      jwtService.verifyToken.mockReturnValue(mockUser);
      User.findById.mockResolvedValue(mockUser);
      Item.findById.mockResolvedValue({ _id: "item1_id", price: 10 });
      mollieService.createPayment.mockImplementation(() => {
        throw new Error("Payment error"); // Simulate an error
      });

      await orderController.purchase(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Internal Server Error: Payment error",
      });
    });
  });
});
