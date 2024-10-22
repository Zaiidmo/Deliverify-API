const restaurantController = require("../../controllers/restaurantController");
const Restaurant = require("../../models/Restaurant");
const User = require("../../models/User");
const jwtService = require("../../services/jwtService")
const Item = require("../../models/Item");
const restaurantService = require('../../services/restaurantService');

// Mock dependencies
jest.mock('../../services/restaurantService');
jest.mock('../../models/Item');
jest.mock("../../services/jwtService");
jest.mock("../../models/User");

describe("Restaurant Controller - createRestaurant", () => {
  let mockReq, mockRes;

  beforeEach(() => {
    // Mock the req and res objects
    mockReq = {
      headers: {
        authorization: "Bearer mock-token",
      },
      body: {
        name: "Test Restaurant",
        address: "123 Test St",
        phoneNumber: "0123456789",
        logo: "custom-logo.jpg",
        cover: "custom-cover.jpg",
        images: ["img1.jpg", "img2.jpg"],
        location: { type: "Point", coordinates: [40, -73] },
        openAt: "10:00",
        closeAt: "22:00",
        category: { name: "Fast Food", description: "Fast food category" },
      },
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  test("should respond with status 201 and create a restaurant", async () => {
    const mockOwner = { _id: "owner-id" };
    const mockDecodedToken = { _id: "owner-id" };

    // Mock JWT service and User model
    jwtService.verifyToken.mockReturnValue(mockDecodedToken);
    User.findById.mockResolvedValue(mockOwner);

    // Mock restaurant creation service
    const mockRestaurant = {
      ...mockReq.body,
      owner: mockOwner._id,
    };
    restaurantService.createRestaurant.mockResolvedValue(mockRestaurant);

    // Call the createRestaurant function
    await restaurantController.createRestaurant(mockReq, mockRes);

    // Expectations
    expect(jwtService.verifyToken).toHaveBeenCalledWith(
      "mock-token",
      process.env.JWT_SECRET
    );
    expect(User.findById).toHaveBeenCalledWith(mockDecodedToken._id);
    expect(restaurantService.createRestaurant).toHaveBeenCalledWith({
      ...mockReq.body,
      owner: mockOwner,
    });

    // Response expectations
    expect(mockRes.status).toHaveBeenCalledWith(201);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Restaurant créé avec succès",
      restaurant: mockRestaurant,
    });
  });
});

describe('Restaurant Controller - createRestaurantWithItems', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {
        name: "Test Restaurant",
        address: "123 Test St",
        phoneNumber: "0123456789",
        logo: "custom-logo.jpg",
        cover: "custom-cover.jpg",
        images: ["img1.jpg", "img2.jpg"],
        location: { type: "Point", coordinates: [40, -73] },
        openAt: "10:00",
        closeAt: "22:00",
        category: { name: "Fast Food", description: "Fast food category" },
        items: [
          { name: "Burger", price: 10, description: "A delicious burger" },
          { name: "Fries", price: 5, description: "Crispy fries" },
        ],
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createRestaurantWithItems', () => {
    it('should create a restaurant and associated items successfully', async () => {
      const mockRestaurant = {
        _id: "restaurant-id",
        name: "Test Restaurant",
        address: "123 Test St",
        phoneNumber: "0123456789",
        logo: "custom-logo.jpg",
        cover: "custom-cover.jpg",
        images: ["img1.jpg", "img2.jpg"],
        location: { type: "Point", coordinates: [40, -73] },
        openAt: "10:00",
        closeAt: "22:00",
        category: { name: "Fast Food", description: "Fast food category" },
      };

      // Mock restaurant creation
      restaurantService.createRestaurant.mockResolvedValue(mockRestaurant);
      // Mock item saving
      Item.prototype.save = jest.fn().mockResolvedValue(true);

      await restaurantController.createRestaurantWithItems(req, res);

      // Check if restaurant creation is called with correct data
      expect(restaurantService.createRestaurant).toHaveBeenCalledWith({
        name: "Test Restaurant",
        address: "123 Test St",
        phoneNumber: "0123456789",
        logo: "custom-logo.jpg",
        cover: "custom-cover.jpg",
        images: ["img1.jpg", "img2.jpg"],
        location: { type: "Point", coordinates: [40, -73] },
        openAt: "10:00",
        closeAt: "22:00",
        category: { name: "Fast Food", description: "Fast food category" },
      });

      // Check if items are saved with the restaurant ID
      expect(Item.prototype.save).toHaveBeenCalledTimes(req.body.items.length);

      // Check the success response
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "Restaurant and items created successfully",
        restaurant: mockRestaurant,
      });
    });

    it('should return 500 if an error occurs during restaurant creation', async () => {
      const mockError = new Error("Restaurant creation failed");

      // Mock restaurantService to throw an error
      restaurantService.createRestaurant.mockRejectedValue(mockError);

      await restaurantController.createRestaurantWithItems(req, res);

      // Check the error response
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: mockError.message });
    });
  });
});
