const {
  createRestaurantWithItems,
  addItemsToRestaurant,
} = require("../../controllers/manageMealsController");
const Restaurant = require("../../models/Restaurant");
const Item = require("../../models/Item");

jest.mock("../../models/Restaurant");
jest.mock("../../models/Item");

describe("Restaurant Controller", () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {
        name: "Test Restaurant",
        location: "Test Location",
        items: [
          {
            name: "Item 1",
            description: "Test item 1",
            price: 10,
            category: "Appetizer",
            image: "item1.png",
          },
          {
            name: "Item 2",
            description: "Test item 2",
            price: 20,
            category: "Main",
            image: "item2.png",
          },
        ],
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  // Tests for createRestaurantWithItems function
  describe("createRestaurantWithItems", () => {
    it("should create a restaurant and associated items", async () => {
      //   create a mock Restaurant model and Item model
      const mockRestaurant = {
        name: "Test Restaurant",
        location: "Test Location",
        items: [
          {
            name: "Item 1",
            description: "Test item 1",
            price: 10,
            category: "Appetizer",
            image: "item1.png",
          },
          {
            name: "Item 2",
            description: "Test item 2",
            price: 20,
            category: "Main",
            image: "item2.png",
          },
        ],
      };

      const mockItem = {
        name: "Item 1",
        description: "Test item 1",
        price: 10,
        category: "Appetizer",
        image: "item1.png",
      };

      Restaurant.mockImplementation(() => ({
        save: jest.fn().mockResolvedValue(mockRestaurant),
      }));

      Item.mockImplementation(() => ({
        save: jest.fn().mockResolvedValue(mockItem),
      }));

      //   call createRestaurantWithItems function
      await createRestaurantWithItems(req, res);

      //   assert that the Restaurant and Item models were called with the correct arguments
      expect(Restaurant).toHaveBeenCalledWith({
        name: "Test Restaurant",
        location: "Test Location",
      });
      expect(Item).toHaveBeenCalledWith({
        name: "Item 1",
        description: "Test item 1",
        price: 10,
        category: "Appetizer",
        image: "item1.png",
      });
    });
    it("should return 500 if an error occurs during restaurant creation", async () => {
      const mockRestaurantSave = jest
        .fn()
        .mockRejectedValue(new Error("Failed to save restaurant"));

      Restaurant.mockImplementation(() => ({
        save: mockRestaurantSave,
      }));

      await createRestaurantWithItems(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Failed to save restaurant",
      });
    });
  });

  // Tests for addItemsToRestaurant function
  describe("addItemsToRestaurant", () => {
    beforeEach(() => {
      req.body = {
        restaurantId: "mockRestaurantId",
        items: [
          {
            name: "Item 1",
            description: "Test item 1",
            price: 10,
            category: "Appetizer",
            image: "item1.png",
          },
          {
            name: "Item 2",
            description: "Test item 2",
            price: 20,
            category: "Main",
            image: "item2.png",
          },
        ],
      };
    });

    it("should add items to the restaurant", async () => {
      const mockItemSave = jest.fn().mockResolvedValue({});

      Item.mockImplementation(() => ({
        save: mockItemSave,
      }));

      await addItemsToRestaurant(req, res);

      expect(mockItemSave).toHaveBeenCalledTimes(2);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "Items added successfully",
      });
    });

    it("should return 500 if an error occurs while adding items", async () => {
      const mockItemSave = jest
        .fn()
        .mockRejectedValue(new Error("Failed to save item"));

      Item.mockImplementation(() => ({
        save: mockItemSave,
      }));

      await addItemsToRestaurant(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Failed to save item",
      });
    });
  });
});
